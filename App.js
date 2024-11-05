import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Generale");
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState(["Generale", "Lavoro", "Personale"]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    loadStoredLinks();
    loadStoredCategories();
  }, []);

  const loadStoredLinks = async () => {
    try {
      const storedLinks = await AsyncStorage.getItem("@links");
      if (storedLinks !== null) {
        setLinks(JSON.parse(storedLinks));
      }
    } catch (error) {
      console.error("Errore durante il caricamento dei link:", error);
    }
  };

  const loadStoredCategories = async () => {
    try {
      const storedCategories = await AsyncStorage.getItem("@categories");
      if (storedCategories !== null) {
        setCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Errore durante il caricamento delle categorie:", error);
    }
  };

  const saveLinks = async (linksToSave) => {
    try {
      await AsyncStorage.setItem("@links", JSON.stringify(linksToSave));
    } catch (error) {
      console.error("Errore durante il salvataggio dei link:", error);
    }
  };

  const saveCategories = async (categoriesToSave) => {
    try {
      await AsyncStorage.setItem("@categories", JSON.stringify(categoriesToSave));
    } catch (error) {
      console.error("Errore durante il salvataggio delle categorie:", error);
    }
  };

  const addLink = () => {
    if (link.trim() === "" || title.trim() === "") {
      Alert.alert("Campi Mancanti", "Per favore inserisci sia un titolo che un link.");
      return;
    }

    const newLink = {
      id: Date.now(),
      url: link.trim(),
      title: title.trim(),
      category,
    };
    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    setLink("");
    setTitle("");
    saveLinks(updatedLinks);
    Keyboard.dismiss();
  };

  const deleteLink = (id) => {
    Alert.alert(
      "Conferma Eliminazione",
      "Sei sicuro di voler eliminare questo link?",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Elimina",
          onPress: () => {
            const updatedLinks = links.filter((link) => link.id !== id);
            setLinks(updatedLinks);
            saveLinks(updatedLinks);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const startEditingCategory = (index, currentName) => {
    setEditingIndex(index);
    setEditingText(currentName);
  };

  const saveCategory = (index) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = editingText.trim();
    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setEditingIndex(-1);
    setEditingText("");
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
    setEditingText("");
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerText}>Linker</Text>
      </SafeAreaView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Titolo"
          placeholderTextColor="#B0B0B0"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Inserisci un link"
          placeholderTextColor="#B0B0B0"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
        />
        <Text style={styles.labelText}>Scegli categoria:</Text>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat} value={cat} />
          ))}
        </Picker>
        <Button title="Aggiungi Link" onPress={addLink} color="#1e90ff" />
      </View>
      <ScrollView style={styles.linkList} contentContainerStyle={{ paddingBottom: 20 }}>
        {categories.map((cat, index) => (
          <View key={index} style={styles.categorySection}>
            <View style={styles.categoryHeaderContainer}>
              {editingIndex === index ? (
                <>
                  <TextInput
                    style={styles.categoryInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    autoFocus
                  />
                  <View style={styles.categoryButtonContainer}>
                    <TouchableOpacity onPress={() => saveCategory(index)}>
                      <Text style={styles.saveButton}>Salva</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={cancelEditing}>
                      <Text style={styles.cancelButton}>Annulla</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.categoryHeader}>{cat}</Text>
                  <TouchableOpacity onPress={() => startEditingCategory(index, cat)}>
                    <Text style={styles.editButton}>Modifica</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            {links
              .filter((link) => link.category === cat)
              .map((item, idx) => (
                <View key={idx} style={styles.linkItemContainer}>
                  <TouchableOpacity onPress={() => openLink(item.url)} style={styles.linkContent}>
                    <Text style={styles.linkTitle}>{item.title}</Text>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.linkItem}>
                      {item.url}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteLink(item.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Elimina</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  labelText: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 10,
    marginBottom: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1A1A1A",
  },
  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 6,
    color: "#ffffff",
    backgroundColor: "#2A2A2A",
  },
  picker: {
    height: 50,
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
    color: "#ffffff",
    backgroundColor: "#2A2A2A",
  },
  linkList: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  categoryInput: {
    flex: 1,
    fontSize: 18,
    color: "#ffffff",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 6,
  },
  categoryButtonContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },
  saveButton: {
    color: "#1e90ff",
    fontSize: 16,
    marginRight: 10,
  },
  cancelButton: {
    color: "#FF6666",
    fontSize: 16,
  },
  linkItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 6,
    marginBottom: 8,
  },
  linkContent: {
    flex: 1,
    marginRight: 8,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  linkItem: {
    fontSize: 14,
    color: "#1e90ff",
    textDecorationLine: "underline",
  },
  deleteButton: {
    padding: 6,
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#FF6666",
    fontSize: 12,
  },
  editButton: {
    color: "#1e90ff",
    fontSize: 16,
  },
});

export default App;
