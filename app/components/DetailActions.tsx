import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

interface DetailActionsProps {
  onDelete: () => Promise<void>;
  editRoute: string;
  entityName: string;
}

export const DetailActions = ({ onDelete, editRoute, entityName }: DetailActionsProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.editButton]}
        onPress={() => router.push(editRoute)}
      >
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.deleteButton]}
        onPress={onDelete}
      >
        <Text style={[styles.buttonText, styles.deleteButtonText]}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
}); 