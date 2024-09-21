import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from "../sequelizeConnection";

interface RoleAttributes {
  id: number;
  name: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
}

Role.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'role'
});

interface UserAttributes {
    id: number;
    name: string;
    lastname: string;
    email: string;
    password: string;
    role_fk?: number;
  }
  
  interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}
  
  class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public lastname!: string;
    public email!: string;
    public password!: string;
    public role_fk?: number;
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role_fk: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Role,
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false, 
  });

  interface MediaAttributes {
    id: number;
    youtube?: string;
    podcast?: string;
    book?: string;
  }
  
  interface MediaCreationAttributes extends Optional<MediaAttributes, 'id'> {}
  
  class Media extends Model<MediaAttributes, MediaCreationAttributes> implements MediaAttributes {
    public id!: number;
    public youtube?: string;
    public podcast?: string;
    public book?: string;
  }
  
  Media.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    youtube: {
      type: DataTypes.STRING(255)
    },
    podcast: {
      type: DataTypes.STRING(255)
    },
    book: {
      type: DataTypes.STRING(255)
    }
  }, {
    sequelize,
    modelName: 'Media',
    tableName: 'media'
  });


interface ReviewAttributes {
    id: number;
    media_fk?: number;
    title: string;
    description: string;
    user_fk: number;
  }
  
  interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}
  
  class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public id!: number;
    public media_fk?: number;
    public title!: string;
    public description!: string;
    public user_fk!: number;
  }
  
  Review.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    media_fk: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Media,
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    user_fk: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews'
  });


  interface ReviewActionsAttributes {
  action_user_fk: number;
  action_review_fk: number;
  action_gesture: number;
}

class ReviewActions extends Model<ReviewActionsAttributes> implements ReviewActionsAttributes {
  public action_user_fk!: number;
  public action_review_fk!: number;
  public action_gesture!: number;
}

ReviewActions.init({
  action_user_fk: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  action_review_fk: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: Review,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  action_gesture: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ReviewActions',
  tableName: 'review_actions'
});




User.hasMany(ReviewActions, { foreignKey: 'action_user_fk' });
Review.hasMany(ReviewActions, { foreignKey: 'action_review_fk' });
ReviewActions.belongsTo(User, { foreignKey: 'action_user_fk' });
ReviewActions.belongsTo(Review, { foreignKey: 'action_review_fk' });
  
User.hasMany(Review, { foreignKey: 'user_fk' });
Review.belongsTo(User, { foreignKey: 'user_fk' });
Media.hasMany(Review, { foreignKey: 'media_fk' });
Review.belongsTo(Media, { foreignKey: 'media_fk' });
  
Role.hasMany(User, { foreignKey: 'role_fk' });
User.belongsTo(Role, { foreignKey: 'role_fk' });
export {
    User,
    Role,
    Media,
    Review,
    ReviewActions
}



  
