import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { openDatabase } from 'expo-sqlite';

const db = openDatabase('todo.db');

export default function HomeScreen({ navigation }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);'
      );
      tx.executeSql('SELECT * FROM groups', [], (_, { rows }) =>
        setGroups(rows._array)
      );
    });
  }, []);

  const addGroup = (name) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO groups (name) VALUES (?)', [name],
        (_, { insertId }) => setGroups([...groups, { id: insertId, name }])
      );
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() => navigation.navigate('TodoList', { groupId: item.id, groupName: item.name })}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => addGroup('New Group')}>
        <Text>Add Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  groupItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
});