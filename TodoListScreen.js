import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { openDatabase } from 'expo-sqlite';

const db = openDatabase('todo.db');

export default function TodoListScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, groupId INTEGER, title TEXT, description TEXT, completed INTEGER);'
      );
      tx.executeSql('SELECT * FROM tasks WHERE groupId = ?', [groupId], (_, { rows }) =>
        setTasks(rows._array)
      );
    });
  }, [groupId]);

  const addTask = () => {
    navigation.navigate('TaskForm', { groupId });
  };

  const toggleTaskCompletion = (id, completed) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 0 : 1, id],
        () => {
          setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !completed } : task
          ));
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          >
            <Text style={item.completed ? styles.completedTask : null}>{item.title}</Text>
            <TouchableOpacity onPress={() => toggleTaskCompletion(item.id, item.completed)}>
              <Text>{item.completed ? '✓' : '○'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
});