import React, { useState, useEffect, useContext } from 'react';
import { Tabs } from 'antd';
import { ServerStatusContext } from '../../utils/server-status-context';
import { CONNECTED_CLIENTS, fetchData, DISABLED_USERS, MODERATORS } from '../../utils/apis';
import UserTable from '../../components/user-table';
import ClientTable from '../../components/client-table';

const { TabPane } = Tabs;

export const FETCH_INTERVAL = 10 * 1000; // 10 sec

export default function ChatUsers() {
  const context = useContext(ServerStatusContext);
  const { online } = context || {};

  const [disabledUsers, setDisabledUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [moderators, setModerators] = useState([]);

  const getInfo = async () => {
    try {
      const result = await fetchData(DISABLED_USERS);
      setDisabledUsers(result);
    } catch (error) {
      console.log('==== error', error);
    }

    try {
      const result = await fetchData(CONNECTED_CLIENTS);
      setClients(result);
    } catch (error) {
      console.log('==== error', error);
    }

    try {
      const result = await fetchData(MODERATORS);
      setModerators(result);
    } catch (error) {
      console.error('error fetching moderators', error);
    }
  };

  useEffect(() => {
    let getStatusIntervalId = null;

    getInfo();

    getStatusIntervalId = setInterval(getInfo, FETCH_INTERVAL);
    // returned function will be called on component unmount
    return () => {
      clearInterval(getStatusIntervalId);
    };
  }, [online]);

  const connectedUsers = online ? (
    <>
      <ClientTable data={clients} />
      <p className="description">
        เข้าชมเว็บ{' '}
        <a href="https://pnckdevapp.com/?source=admin" target="_blank" rel="noopener noreferrer">
          เอกสาร
        </a>{' '}
        เพื่อกำหนดค่ารายละเอียดเพิ่มเติมเกี่ยวกับผู้ดูของคุณ
      </p>
    </>
  ) : (
    <p className="description">
      เมื่อสตรีมทำงานและเปิดใช้งานการแชท ไคลเอนต์แชทที่เชื่อมต่อจะแสดงที่นี่
    </p>
  );

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab={<span>เชื่อมต่อ {online ? `(${clients.length})` : '(offline)'}</span>} key="1">
        {connectedUsers}
      </TabPane>
      <TabPane tab={<span>Banned {online ? `(${disabledUsers.length})` : null}</span>} key="2">
        <UserTable data={disabledUsers} />
      </TabPane>
      <TabPane tab={<span>ผู้ดูแล {online ? `(${moderators.length})` : null}</span>} key="3">
        <UserTable data={moderators} />
      </TabPane>
    </Tabs>
  );
}
