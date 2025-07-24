import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './db';
import { v4 as uuidv4 } from 'uuid';  // Import uuid to generate unique IDs

interface NoteAttributes {
  id: string;  // UUID will be a string
  title: string;
  content: string;
  userId: number;
}

interface NoteCreationAttributes extends Optional<NoteAttributes, 'id'> {}

class Note extends Model<NoteAttributes, NoteCreationAttributes> implements NoteAttributes {
  public id!: string;
  public title!: string;
  public content!: string;
  public userId!: number;
}

Note.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4,  // Automatically generate a UUID v4 for the ID
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'notes',
  }
);

export default Note;
