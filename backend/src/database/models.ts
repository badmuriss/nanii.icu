import mongoose, { Document, Schema } from 'mongoose';

export interface IUrl extends Document {
  _id: mongoose.Types.ObjectId;
  shortName: string;
  originalUrl: string;
  customName?: string;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  userIp?: string;
  userAgent?: string;
}

export interface IClick extends Document {
  _id: mongoose.Types.ObjectId;
  urlId: mongoose.Types.ObjectId;
  clickedAt: Date;
  userIp?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
}

const urlSchema = new Schema<IUrl>({
  shortName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  customName: {
    type: String,
    sparse: true,
    index: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  userIp: {
    type: String
  },
  userAgent: {
    type: String
  }
});

const clickSchema = new Schema<IClick>({
  urlId: {
    type: Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true
  },
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  userIp: {
    type: String
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  },
  country: {
    type: String
  }
});

urlSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

export const Url = mongoose.model<IUrl>('Url', urlSchema);
export const Click = mongoose.model<IClick>('Click', clickSchema);

export interface CreateUrlRequest {
  originalUrl: string;
  customName?: string;
  userIp?: string;
  userAgent?: string;
  expiresAt?: Date;
}

export interface CreateClickRequest {
  urlId: mongoose.Types.ObjectId;
  userIp?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
}

export interface IHub extends Document {
  _id: mongoose.Types.ObjectId;
  hubName: string;
  title: string;
  description?: string;
  links: Array<{
    title: string;
    url: string;
    order: number;
  }>;
  customName?: string;
  clickCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  userIp?: string;
  userAgent?: string;
}

const hubSchema = new Schema<IHub>({
  hubName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  links: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  customName: {
    type: String,
    sparse: true,
    index: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  userIp: {
    type: String
  },
  userAgent: {
    type: String
  }
});

hubSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

export const Hub = mongoose.model<IHub>('Hub', hubSchema);

export interface CreateHubRequest {
  title: string;
  description?: string;
  links: Array<{
    title: string;
    url: string;
    order: number;
  }>;
  customName?: string;
  userIp?: string;
  userAgent?: string;
  expiresAt?: Date;
}

export interface UrlStats {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  recentClicks: IClick[];
}

export interface HubStats {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  linkStats: Array<{
    title: string;
    url: string;
    clicks: number;
  }>;
}