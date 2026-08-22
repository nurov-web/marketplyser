import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest } from "../middleware/auth";
import { toNum } from "../utils/helpers";

export type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: { toNumber?: () => number } | number | string;
  minSubtotal: { toNumber?: () => number } | number | string;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
};

export function couponDiscount(coupon: CouponRow, subtotal: number) {
  const min = toNum(coupon.minSubtotal);
  const value = toNum(coupon.value);
  if (subtotal < min) return 0;
  if (coupon.type === "PERCENT") return Math.round(((subtotal * value) / 100) * 100) / 100;
  return Math.min(value, subtotal);
}

export async function findValidCoupon(code: string, userId?: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) return { error: "Купон нодуруст аст" as const, coupon: null };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "Мӯҳлати купон гузаштааст" as const, coupon: null };
  if (coupon.usedCount >= coupon.maxUses) return { error: "Купон дигар дастрас нест" as const, coupon: null };
  if (userId) {
    const used = await prisma.couponUse.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId } },
    });
    if (used) return { error: "Ин купон аллакай истифода шудааст" as const, coupon: null };
  }
  return { error: null, coupon };
}

export const validateSchema = z.object({
  code: z.string().min(2),
  subtotal: z.number().min(0).optional(),
});

export async function validateCoupon(req: AuthedRequest, res: Response) {
  const code = String(req.body?.code || req.query.code || "");
  const subtotal = Number(req.body?.subtotal ?? req.query.subtotal ?? 0);
  const { error, coupon } = await findValidCoupon(code, req.user?.id);
  if (!coupon) return res.status(400).json({ message: error });
  const discount = couponDiscount(coupon, subtotal);
  if (subtotal > 0 && subtotal < toNum(coupon.minSubtotal)) {
    return res.status(400).json({
      message: `Ҳадди ақал ${toNum(coupon.minSubtotal)} с. лозим аст`,
    });
  }
  return res.json({
    code: coupon.code,
    type: coupon.type,
    value: toNum(coupon.value),
    discount,
    minSubtotal: toNum(coupon.minSubtotal),
  });
}
