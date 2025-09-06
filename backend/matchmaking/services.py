"""
AI-powered matching service using Hugging Face sentence transformers
"""
import json
import numpy as np
from typing import List, Dict, Any
from django.contrib.auth import get_user_model
from accounts.models import UserEmbedding
from sentence_transformers import SentenceTransformer

User = get_user_model()


class MatchingService:
    def cosine_similarity(self, a, b):
        """Compute cosine similarity between two vectors."""
        import numpy as np
        a = np.array(a)
        b = np.array(b)
        if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
            return 0.0
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    def find_matches_by_query(self, skills=None, interests=None, limit=20):
        # If no query, return empty list
        if not skills and not interests:
            return []

        # Get all users except those with empty skills/interests
        users = User.objects.all()
        candidates = []
        for user in users:
            user_skills = getattr(user, 'skills', []) or []
            user_interests = getattr(user, 'interests', []) or []
            if user_skills or user_interests:
                candidates.append(user)

        # Compute Jaccard similarity for skills and interests
        def jaccard(query, user):
            set_query, set_user = set(query), set(user)
            if not set_query:
                return 0.0
            intersection = set_query & set_user
            # Use only the number of searched items for denominator
            return float(len(intersection)) / float(len(set_query))

        results = []
        for user in candidates:
            user_skills = getattr(user, 'skills', []) or []
            user_interests = getattr(user, 'interests', []) or []
            skills_similarity = jaccard(skills, user_skills)
            interests_similarity = jaccard(interests, user_interests)
            # Combined: average of both if both provided, else whichever is present
            if skills and interests:
                combined_similarity = (skills_similarity + interests_similarity) / 2
            elif skills:
                combined_similarity = skills_similarity
            elif interests:
                combined_similarity = interests_similarity
            else:
                combined_similarity = 0.0
            score = combined_similarity
            results.append({
                'user': user,
                'skills_similarity': skills_similarity,
                'interests_similarity': interests_similarity,
                'combined_similarity': combined_similarity,
                'score': score
            })

        # Sort by score and return top N
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:limit]
    """Service for AI-powered user matching"""
    def __init__(self):
        # Use real Hugging Face model
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.using_mock = False
    
    def create_user_embedding(self, user: User) -> Dict[str, List[float]]:
        """Create embeddings for a user's skills and interests"""
        # Combine skills and interests into text
        skills_text = " ".join(user.skills) if user.skills else ""
        interests_text = " ".join(user.interests) if user.interests else ""
        combined_text = f"{skills_text} {interests_text}".strip()
        
        # Generate embeddings
        texts = [skills_text, interests_text, combined_text]
        embeddings = self.model.encode(texts)
        
        embedding_data = {
            'skills_embedding': embeddings[0].tolist(),
            'interests_embedding': embeddings[1].tolist(), 
            'combined_embedding': embeddings[2].tolist()
        }
        
        # Store in database
        user_embedding, created = UserEmbedding.objects.get_or_create(
            user=user,
            defaults=embedding_data
        )
        
        if not created:
            # Update existing embedding
            for key, value in embedding_data.items():
                setattr(user_embedding, key, value)
            user_embedding.save()
        
        return embedding_data
    
    def calculate_similarity(self, emb1: List[float], emb2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        if not emb1 or not emb2:
            return 0.0
        
        emb1 = np.array(emb1)
        emb2 = np.array(emb2)
        
        # Cosine similarity
        dot_product = np.dot(emb1, emb2)
        norm_product = np.linalg.norm(emb1) * np.linalg.norm(emb2)
        
        if norm_product == 0:
            return 0.0
        
        return dot_product / norm_product
    
    def find_matches(self, user: User, limit: int = 20) -> List[Dict[str, Any]]:
        """Find matching users based on skills and interests"""
        # Get or create user's embedding
        user_embedding_data = self.create_user_embedding(user)
        
        # Get all other users with embeddings
        other_users = User.objects.exclude(id=user.id).prefetch_related('userembedding')
        matches = []
        
        for other_user in other_users:
            try:
                other_embedding = other_user.userembedding
            except UserEmbedding.DoesNotExist:
                # Create embedding for user without one
                self.create_user_embedding(other_user)
                other_embedding = other_user.userembedding
            
            # Calculate similarities
            skills_sim = self.calculate_similarity(
                user_embedding_data['skills_embedding'],
                other_embedding.skills_embedding
            )
            
            interests_sim = self.calculate_similarity(
                user_embedding_data['interests_embedding'],
                other_embedding.interests_embedding
            )
            
            combined_sim = self.calculate_similarity(
                user_embedding_data['combined_embedding'],
                other_embedding.combined_embedding
            )
            
            # Weighted average (prioritize combined similarity)
            overall_score = (
                combined_sim * 0.5 +
                skills_sim * 0.3 +
                interests_sim * 0.2
            )
            
            matches.append({
                'user': other_user,
                'score': overall_score,
                'skills_similarity': skills_sim,
                'interests_similarity': interests_sim,
                'combined_similarity': combined_sim
            })
        
        # Sort by score and return top matches
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:limit]
    
    def get_availability_overlap(self, user1: User, user2: User) -> Dict[str, float]:
        """Calculate availability overlap between two users"""
        if not user1.availability or not user2.availability:
            return {'overlap_percentage': 0.0, 'common_times': []}
        
        # Simple implementation - in reality this would be more sophisticated
        user1_available = set()
        user2_available = set()
        
        # Convert availability JSON to sets of time slots
        for day, times in user1.availability.items():
            if isinstance(times, list):
                for time_slot in times:
                    user1_available.add(f"{day}_{time_slot}")
        
        for day, times in user2.availability.items():
            if isinstance(times, list):
                for time_slot in times:
                    user2_available.add(f"{day}_{time_slot}")
        
        # Calculate overlap
        common_times = user1_available.intersection(user2_available)
        total_slots = len(user1_available.union(user2_available))
        
        overlap_percentage = len(common_times) / total_slots if total_slots > 0 else 0
        
        return {
            'overlap_percentage': overlap_percentage,
            'common_times': list(common_times)
        }