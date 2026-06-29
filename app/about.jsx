import { StyleSheet, useColorScheme, Text, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import Colors from '../constants/Colors'

const About = () => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] || Colors.light
  const router = useRouter()

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text onPress={() => router.push('/')} style={styles.link}>
        <Text style={{ color: theme.text }}>Back</Text>
      </Text>
      <Text style={[styles.title, { color: theme.text }]}>About Page</Text>
    </View>
  )
}

export default About

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingBottom: 5,
  },
})
