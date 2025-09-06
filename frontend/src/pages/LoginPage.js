import React from "react";
import "./index.css";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaGoogle, FaUsers, FaBrain, FaClock } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const FeatureBox = ({ icon, title, description }) => {
  const bg = useColorModeValue("white", "gray.700");
  const shadow = useColorModeValue("md", "dark-lg");
  return (
    <VStack
      bg={bg}
      p={6}
      rounded="lg"
      shadow={shadow}
      spacing={4}
      align="start"
      w="full"
    >
      <Icon as={icon} boxSize={8} color="brand.500" />
      <Heading size="md">{title}</Heading>
      <Text color="gray.600">{description}</Text>
    </VStack>
  );
};

export default function Main() {
  const { signInWithGoogle, loading, error, user } = useAuth();
  const bg = useColorModeValue("gray.50", "gray.900");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/"); // Redirect to home/dashboard after login
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="main-container">
      <div className="empty">
        <div className="frame">
          <div className="background-noise" />
          <div className="group-10">
            <div className="flex-row-ead">
              <div className="group-11">
                <div className="fluent-people-team-regular" />
                <div className="rectangle" />
              </div>
              <div className="rectangle-12" />
              <div className="group-13">
                <div className="frame-14">
                  <span className="text-7">230+</span>
                  <span className="people-have-found">
                    People have found their matches and teams thorugh
                    QuicSync!
                  </span>
                </div>
                <div className="group-15" />
                <div className="rectangle-16" />
              </div>
            </div>
            <div className="group-17">
              <div className="frame-18">
                <div className="frame-19">
                  <div className="vector-1a" />
                  <span className="heatmap-availability">
                    Heatmap Availability
                  </span>
                </div>
                <span className="profile-skills">
                  Let your profile speak for your skills!{" "}
                </span>
              </div>
              <div className="image" />
              <div className="rectangle-1b" />
            </div>
          </div>
          <div className="flex-column">
            <span className="google-authentication">
              Quick and secure authentication with your google account
            </span>
            <div className="frame-1c">
              <div className="frame-1d">
                <span className="welcome-quicksync">
                  Welcome to <br />
                  QuickSync!
                </span>
              </div>
              <span className="matchmaking-platform">
                The ultimate matchmaking platform for hackathons and
                collaboration events. Find your perfect teammates based on
                skills, interests and availability.
              </span>
              <div className="frame-1e">
                <div className="frame-1f">
                  <div className="whatsapp-image" />
                  <div className="arrow-right" />
                  <div className="frame-20">
                    <span className="sign-in-google">Continue with Google</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="div">
        <div className="frame-21">
          <div className="frame-22">
            <span className="why-choose-quicksync">Why choose QuickSync?</span>
            <div className="frame-23">
              <div className="frame-24">
                <div className="frame-25">
                  <span className="see-more">See more</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-row-cb">
            <div className="frame-26">
              <div className="frame-27">
                <div className="frame-28">
                  <span className="smart-matchmaking">Smart Matchmaking </span>
                </div>
                <div className="flex-row-b">
                  <div className="frame-29">
                    <span className="ai-powered-matching">
                      AI- powered matching based on your skills, interests and
                      project preferences using advanced semantic analysis.
                    </span>
                  </div>
                  <div className="frame-2a">
                    <div className="arrow-right-2b" />
                  </div>
                </div>
              </div>
            </div>
            <div className="frame-2c">
              <div className="frame-2d">
                <div className="frame-2e">
                  <span className="one-click-teams">One-Click Teams</span>
                </div>
                <div className="flex-row-fff">
                  <div className="frame-2f">
                    <span className="write-the-info">WRITE THE INFO</span>
                  </div>
                  <div className="frame-30">
                    <div className="arrow-right-31" />
                  </div>
                </div>
              </div>
            </div>
            <div className="frame-32">
              <div className="frame-33">
                <div className="frame-34">
                  <span className="availability-heatmap">
                    Availability Heatmap
                  </span>
                </div>
                <div className="flex-row-ebc">
                  <div className="frame-35">
                    <span className="write-the-info-36">WRITE THE INFO</span>
                  </div>
                  <div className="frame-37">
                    <div className="arrow-right-38" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="background-noise-39" />
        </div>
      </div>
    </div>
  );
}
