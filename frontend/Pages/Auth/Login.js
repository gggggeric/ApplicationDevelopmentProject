import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import { showToast } from '../../utils/toast';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }
    console.log('Login attempt with:', email, password);
    // Your login logic here
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/samplelogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title="Login"
        onPress={handleLogin}
        style={styles.button}
      />
      
      <Text
        style={styles.toggleText}
        onPress={() => navigation.navigate('Register')}
      >
        Need an account? Register
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: '#6200ee',
  },
  toggleText: {
    color: '#6200ee',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});

export default Login;