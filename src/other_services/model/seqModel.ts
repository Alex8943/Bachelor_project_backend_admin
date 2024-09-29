import { DataTypes, Model } from 'sequelize';
import sequelize from "../sequelizeConnection"

// Role Model
class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'role',
  timestamps: false
});

// User Model
class User extends Model {}

User.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
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
    type: DataTypes.BIGINT,
    references: {
      model: 'role',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE
  },
  verified_at: {
    type: DataTypes.DATE
  },
  verification_key: {
    type: DataTypes.STRING(36)
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'user',
  paranoid: true,  // Enables soft delete (tombstone pattern)
  deletedAt: 'deleted_at',
  timestamps: false
});

// Review Model
class Review extends Model {}

Review.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  media_fk: {
    type: DataTypes.BIGINT,
    references: {
      model: 'media',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_fk: {
    type: DataTypes.BIGINT,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE
  },
  is_blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'review',
  paranoid: true,  // Enables soft delete (tombstone pattern)
  deletedAt: 'deleted_at',
  timestamps: false
});

// MediaType Model
class MediaType extends Model {}

MediaType.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'media_type',
  timestamps: false
});

// Media Model
class Media extends Model {}

Media.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  media_type_fk: {
    type: DataTypes.BIGINT,
    references: {
      model: 'media_type',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'media',
  timestamps: false
});

// ReviewAction Model
class ReviewAction extends Model {}

ReviewAction.init({
  action_user_fk: {
    type: DataTypes.BIGINT,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  action_review_fk: {
    type: DataTypes.BIGINT,
    references: {
      model: 'review',
      key: 'id'
    }
  },
  action_gesture: {
    type: DataTypes.INTEGER, // 1 for like, 2 for dislike, 3 for heart
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'review_action',
  timestamps: false
});

// Associations (Defining Foreign Key Relationships)

// A Role can have many Users
Role.hasMany(User, { foreignKey: 'role_fk', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_fk', as: 'role' });

// A User can have many Reviews
User.hasMany(Review, { foreignKey: 'user_fk', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_fk', as: 'user' });

// A MediaType can have many Media
MediaType.hasMany(Media, { foreignKey: 'media_type_fk', as: 'media' });
Media.belongsTo(MediaType, { foreignKey: 'media_type_fk', as: 'media_type' });

// A Media can have many Reviews
Media.hasMany(Review, { foreignKey: 'media_fk', as: 'reviews' });
Review.belongsTo(Media, { foreignKey: 'media_fk', as: 'media' });

// A User can perform many ReviewActions
User.hasMany(ReviewAction, { foreignKey: 'action_user_fk', as: 'actions' });
ReviewAction.belongsTo(User, { foreignKey: 'action_user_fk', as: 'user' });

// A Review can have many ReviewActions
Review.hasMany(ReviewAction, { foreignKey: 'action_review_fk', as: 'actions' });
ReviewAction.belongsTo(Review, { foreignKey: 'action_review_fk', as: 'review' });

export { Role, User, Review, MediaType, Media, ReviewAction };
