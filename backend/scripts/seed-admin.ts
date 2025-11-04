// backend/scripts/seed-admin.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

async function main() {
  const prisma = new PrismaClient();

  const email = 'admin@example.com';
  const plain = 'admin123';                 // كلمة السر التي تريدها
  const PEPPER = process.env.PASSWORD_PEPPER || '';
  const COST = Number(process.env.BCRYPT_COST || 10);

  // 1) Hash فعلي للتسجيل (كما يفعل الباكند)
  const salt = bcrypt.genSaltSync(COST);
  const passwordHashed = bcrypt.hashSync(plain + PEPPER, salt);

  // 2) توقيع إضافي للحقل الإجباري passwordSig
  //    (لو عندك منطق مختلف في الـauth غيّر السطرين التاليين ليتطابق معه)
  const passwordSig = crypto
    .createHash('sha256')
    .update(plain + PEPPER)
    .digest('hex');

  // إنشـاء/تحديث المستخدم
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHashed, passwordSig, role: 'admin', name: 'Admin' },
    create: { email, password: passwordHashed, passwordSig, role: 'admin', name: 'Admin' }
  });

  console.log('✅ Seeded user:', { id: user.id, email: user.email, role: user.role });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
