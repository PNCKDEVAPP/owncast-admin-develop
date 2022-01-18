import React from 'react';
import { Typography } from 'antd';
import EditServerDetails from '../components/config/edit-server-details';

const { Title } = Typography;

export default function ConfigServerDetails() {
  return (
    <div className="config-server-details-form">
      <Title>Server Settings</Title>
      <p className="description">
        คุณควรเปลี่ยนสตรีมคีย์จากค่าเริ่มต้นและเก็บไว้ให้ปลอดภัย สำหรับคนส่วนใหญ่
        เป็นไปได้ว่าการตั้งค่าอื่นๆ จะไม่ต้องเปลี่ยนแปลง
      </p>
      <div className="form-module config-server-details-container">
        <EditServerDetails />
      </div>
    </div>
  );
}
