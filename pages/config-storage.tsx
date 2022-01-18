import { Typography } from 'antd';
import React from 'react';
import EditStorage from '../components/config/edit-storage';

const { Title } = Typography;

export default function ConfigStorageInfo() {
  return (
    <>
      <Title>Storage</Title>
      <p className="description">
        UFAXLIVE รองรับตัวเลือกโดยใช้ผู้ให้บริการจัดเก็บข้อมูลภายนอกเพื่อสตรีมวิดีโอของคุณ เรียนรู้
        เพิ่มเติมเกี่ยวกับเรื่องนี้โดยไปที่ของเรา{' '}
        <a
          href="https://pnckdevapp.com?/docs/storage/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          เอกสารการจัดเก็บ
        </a>
        .
      </p>
      <p className="description">
        การกำหนดค่านี้ไม่ถูกต้องอาจทำให้วิดีโอของคุณไม่สามารถเล่นได้ ตรวจสอบอีกครั้ง
        เอกสารประกอบสำหรับผู้ให้บริการพื้นที่เก็บข้อมูลของคุณเกี่ยวกับวิธีกำหนดค่าบัคเก็ตที่คุณสร้างขึ้นสำหรับ
        เจ้าของ
      </p>
      <p className="description">
        โปรดทราบว่านี่มีไว้สำหรับสตรีมมิงแบบสด ไม่ใช่เพื่อการเก็บถาวร การบันทึก หรือ VOD
      </p>
      <EditStorage />
    </>
  );
}
