import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth, db } from '../firebaseConfig';

function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
    </View>
  );
}

function InventoryScreen() {
  const [book, setBook] = useState({
    ISBN: "",
    author: "",
    image: "",
    price: "",
    publishDate: "",
    quantity: "",
    ratings: "",
    status: "",
    summary: "",
    title: "",
    type: "",
  });

  const [books, setBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchBooks = async () => {
    try {
      const booksCol = collection(db, "books");
      const booksSnapshot = await getDocs(booksCol);
      const booksData = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching books: ", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (key, value) => {
    setBook({ ...book, [key]: value });
  };

  const handleAddBook = async () => {
    try {
      if (!book.title || !book.ISBN) {
        alert("Title and ISBN are required.");
        return;
      }

      const formattedBook = {
        ...book,
        price: parseFloat(book.price),
        quantity: parseInt(book.quantity),
        ratings: parseInt(book.ratings),
        publishDate: new Date(book.publishDate),
      };

      await addDoc(collection(db, "books"), formattedBook);
      setBook({
        ISBN: "",
        author: "",
        image: "",
        price: "",
        publishDate: "",
        quantity: "",
        ratings: "",
        status: "",
        summary: "",
        title: "",
        type: "",
      });
      setModalVisible(false);
      fetchBooks();
    } catch (error) {
      console.error("Error adding book: ", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "books", id));
              fetchBooks();
            } catch (e) {
              console.error("Delete failed:", e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.bookImage} />
      ) : (
        <View style={[styles.bookImage, styles.placeholderImage]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text>Author: {item.author}</Text>
        <Text>₱{item.price}</Text>
        <Text><Ionicons name="cart"></Ionicons>: {item.quantity}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.editButton} onPress={() => alert('Edit not implemented yet')}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search books by title or author"
        style={styles.searchInput}
        // value={searchQuery}
        // onChangeText={setSearchQuery}
      />
      <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.addButtonTop}
      >
        <Text style={styles.addButtonText}>+ Add Book</Text>
      </TouchableOpacity>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={{ width: "100%" }}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.title}>Add Book</Text>
          {Object.keys(book).map((key) => (
            <TextInput
              key={key}
              placeholder={key}
              style={styles.input}
              value={book[key]}
              onChangeText={(text) => handleChange(key, text)}
              keyboardType={
                ["price", "quantity", "ratings"].includes(key) ? "numeric" : "default"
              }
            />
          ))}
          <Button title="Save" onPress={handleAddBook} />
          <Button
            title="Cancel"
            onPress={() => setModalVisible(false)}
            color="gray"
          />
        </ScrollView>
      </Modal>
    </View>
  );
}


function ProfileScreen({ route }) {
  const { uid } = route.params; // get uid from props
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.warn('No user document found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchProfile();
  }, [uid]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Profile</Text>
      <Text style={styles.label}>First Name: <Text style={styles.value}>{userData?.firstName}</Text></Text>
      <Text style={styles.label}>Last Name: <Text style={styles.value}>{userData?.lastName}</Text></Text>
      <Text style={styles.label}>Role: <Text style={styles.value}>{userData?.role}</Text></Text>
      <Text style={styles.label}>Birthdate: <Text style={styles.value}>{userData?.birthdate}</Text></Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App({ route }) {
  const uid = route?.params?.uid;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'black',
        tabBarStyle: {
          backgroundColor: 'peru',
          height: 65,
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          textAlign: 'center',
          paddingBottom: 5,
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ uid }}  // pass uid as initial param here
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bookItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  bookImage: {
    width: 90,
    height: 120,
    resizeMode: "cover",
    borderRadius: 2,
    marginRight: 10,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  bookDetails: {
    flex: 1,
  },
  bookTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#4caf50",
    padding: 6,
    marginRight: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 6,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addButtonTop: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContent: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'ghostwhite', 
    padding: 40,
    borderColor: 'black',
    borderWidth: 0.2,
    opacity: .5,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,  
    height: 50,  
  }
});
