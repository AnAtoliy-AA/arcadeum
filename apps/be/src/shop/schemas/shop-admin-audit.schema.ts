import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const SHOP_ADMIN_ACTIONS = ['override', 'grant', 'revoke'] as const;
export type ShopAdminAction = (typeof SHOP_ADMIN_ACTIONS)[number];

/**
 * Audit trail for admin actions on the shop. Mirrors `EconomySettingsAudit`.
 * One row per admin action (override edit, grant, revoke).
 */
@Schema({ timestamps: true, collection: 'shop_admin_audits' })
export class ShopAdminAudit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  adminUserId!: Types.ObjectId;

  @Prop({ type: String, enum: SHOP_ADMIN_ACTIONS, required: true })
  action!: ShopAdminAction;

  @Prop({ required: true, index: true })
  subjectItemId!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  subjectUserId?: Types.ObjectId | null;

  @Prop({ type: Object, default: null })
  fromValue?: unknown;

  @Prop({ type: Object, default: null })
  toValue?: unknown;

  @Prop({ type: String, default: null })
  reason?: string | null;
}

export type ShopAdminAuditDocument = ShopAdminAudit & Document;
export const ShopAdminAuditSchema =
  SchemaFactory.createForClass(ShopAdminAudit);
