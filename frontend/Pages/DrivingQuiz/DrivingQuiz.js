import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, SafeAreaView } from 'react-native';

const DrivingQuizApp = () => {
  // Quiz questions data
  const questions = [
    {
      id: 1,
      question: "What does this sign mean?",
      image: require('../../assets/stop-sign.png'),
      options: ['Yield', 'Stop', 'No Entry', 'One Way'],
      correctAnswer: 'Stop'
    },
    {
      id: 2,
      question: "What's the first thing you should do when your car starts to skid?",
      options: ['Steer into the skid', 'Brake hard', 'Accelerate', 'Turn the wheel opposite direction'],
      correctAnswer: 'Steer into the skid'
    },
    // Add more questions...
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Animation values
  const progressAnim = useState(new Animated.Value(1))[0];
  const optionScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleAnswer(null); // Time's up
    }
    
    // Update progress bar animation
    Animated.timing(progressAnim, {
      toValue: timeLeft / 10,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  const handleAnswer = (selectedOption) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedOption === currentQuestion.correctAnswer;
    
    setSelectedOption(selectedOption);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 100);
    }
    
    // Animate option selection
    Animated.sequence([
      Animated.timing(optionScale, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(optionScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Move to next question after delay
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      setTimeLeft(10);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Quiz finished
        // Navigate to results screen
      }
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  // Progress bar interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar Animation */}
      <View style={styles.topBar}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        <Text style={styles.timeText}>{timeLeft}s</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      
      {/* Question Area */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.image && (
          <Image source={currentQuestion.image} style={styles.questionImage} />
        )}
      </View>
      
      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          let optionStyle = styles.option;
          let optionTextStyle = styles.optionText;
          
          if (showFeedback) {
            if (option === currentQuestion.correctAnswer) {
              optionStyle = styles.correctOption;
              optionTextStyle = styles.correctOptionText;
            } else if (option === selectedOption && !isCorrect) {
              optionStyle = styles.incorrectOption;
              optionTextStyle = styles.incorrectOptionText;
            }
          }
          
          return (
            <Animated.View 
              key={index}
              style={[
                optionStyle,
                { transform: [{ scale: option === selectedOption ? optionScale : 1 }] }
              ]}
            >
              <TouchableOpacity 
                onPress={() => !showFeedback && handleAnswer(option)}
                disabled={showFeedback}
              >
                <Text style={optionTextStyle}>{option}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
      
      {/* Feedback */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? 'Correct! +100' : 'Wrong! The correct answer is: ' + currentQuestion.correctAnswer}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#4a4e69',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 5,
    backgroundColor: '#f72585',
  },
  timeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  questionImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  option: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  correctOption: {
    backgroundColor: '#4cc9f0',
  },
  correctOptionText: {
    color: 'white',
  },
  incorrectOption: {
    backgroundColor: '#f72585',
  },
  incorrectOptionText: {
    color: 'white',
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
  },
  correctFeedback: {
    color: '#4cc9f0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  incorrectFeedback: {
    color: '#f72585',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DrivingQuizApp;