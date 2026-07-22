# Step: Clone → รันจริง (แอป POS มือถือ)

แอปนี้ไม่ใช่ web server ที่ deploy ขึ้น server เหมือน 3 repo อื่น — เป็นแอปมือถือ (Expo/React Native) จบที่การสร้างไฟล์ APK/AAB แล้วส่งขึ้น Play Store/App Store แทน

## 0. สิ่งที่ต้องมีก่อน
- Node.js
- Android Studio (มี Android SDK + emulator) ถ้าจะเทสบน emulator
- **backend ต้อง deploy และรันอยู่แล้วก่อน** ถ้าจะเทสกับข้อมูลจริง (ดู `step.md` ของ backend)

## 1. Clone + ติดตั้ง
```
git clone <repo-url> pos-mobile-app
cd pos-mobile-app
npm install
```

## 2. ตั้งค่า `.env.local` (สำหรับเทสบนเครื่อง/emulator ระหว่าง dev เท่านั้น)
ไฟล์นี้ไม่ได้ commit ขึ้น git (มี secret/IP เฉพาะเครื่อง) ต้องสร้างเอง:
```
EXPO_PUBLIC_API_URL="http://<LAN IP ของเครื่อง dev>:3010"
EXPO_PUBLIC_OMISE_PUBLIC_KEY="pkey_test_67hn9nj36yjg7wlvvuj"
```
ใช้ LAN IP ของเครื่อง (ไม่ใช่ `localhost`) เพราะ emulator/มือถือจริงต้องต่อผ่านเครือข่าย ไม่ใช่ localhost ของตัวเอง — เช็ค IP ได้จากตอนรัน `npx expo start` (จะโชว์ให้เอง)

## 3. รันเทสระหว่าง dev
```
npx expo start
```
แล้วเปิดผ่าน Expo Go บนมือถือ/emulator — **หมายเหตุ**: ถ้าเจอ error "Project is incompatible with this version of Expo Go" ทั้งที่ Expo Go เป็นเวอร์ชันล่าสุดแล้ว ให้ build เป็น native app แทน (ข้ามไปข้อ 4) ไม่ต้องพยายามแก้ที่ Expo Go

### หรือรันเป็น native build บนเครื่อง (แทน Expo Go)
```
npx expo run:android
```
ต้องมี emulator เปิดอยู่ก่อน (`emulator -avd <ชื่อ AVD>` หรือเปิดผ่าน Android Studio) — รอบแรกจะช้า (compile native code หลายนาที)

**ถ้าเครื่อง dev ตั้ง `JAVA_HOME` เป็น JDK ใหม่เกินไป (เช่น JDK 21+)** จะ build native ไม่ผ่าน (error ประมาณ "restricted method" ระหว่าง configureCMake) ให้ตั้ง `org.gradle.java.home` ใน `android/gradle.properties` ชี้ไปที่ JDK 17 แทน (ปกติไฟล์นี้ถูก generate ใหม่ทุกครั้งที่ลบโฟลเดอร์ `android/` ต้องตั้งซ้ำถ้าลบไปแล้วสร้างใหม่)

## 4. Build จริงเพื่อขึ้น Play Store (EAS Build)
```
npm install -g eas-cli
eas login
eas build --platform android --profile production
```
ครั้งแรกจะถามให้ผูกกับ Expo account/project (สร้าง project ID ให้อัตโนมัติ)

**ก่อน build production ต้องแก้ `eas.json` ก่อน**: หา `"production"` profile แล้วเปลี่ยน `EXPO_PUBLIC_OMISE_PUBLIC_KEY` จาก `"CHANGE_ME_TO_LIVE_OMISE_PUBLIC_KEY"` เป็นคีย์โหมด live จริงจาก Omise dashboard (ตอนนี้ยังเป็นคีย์ placeholder อยู่ ถ้าไม่เปลี่ยนแอปจะรับชำระเงินจริงไม่ได้)

ส่วน `EXPO_PUBLIC_API_URL` ตั้งเป็น `https://pos-api.beautyup-enterprise.com` ไว้แล้ว ไม่ต้องแก้ถ้า backend deploy โดเมนนี้

## 5. ส่งขึ้น Play Store
```
eas submit --platform android
```
ต้องมี Google Play service account key ผูกไว้ก่อน (ตั้งค่าผ่าน Expo/Google Play Console)

## หมายเหตุ
- profile `preview` ใน `eas.json` ยังใช้คีย์ Omise แบบ test อยู่ (สำหรับแจกทดสอบภายในเท่านั้น ไม่ใช่ให้ลูกค้าจริงใช้)
- แอปต้องขอสิทธิ์กล้อง (ถ่ายรูปก่อน-หลัง) — ตั้งไว้ใน `app.json` แล้ว ไม่ต้องแก้อะไรเพิ่ม
