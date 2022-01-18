import React, { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Checkbox,
  Input,
  Typography,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import format from 'date-fns/format';

import { fetchData, ACCESS_TOKENS, DELETE_ACCESS_TOKEN, CREATE_ACCESS_TOKEN } from '../utils/apis';

const { Title, Paragraph } = Typography;

const availableScopes = {
  CAN_SEND_SYSTEM_MESSAGES: {
    name: 'System messages',
    description: 'สามารถส่งข้อความอย่างเป็นทางการในนามระบบ.',
    color: 'purple',
  },
  CAN_SEND_MESSAGES: {
    name: 'User chat messages',
    description: 'สามารถส่งข้อความแชทในนามของเจ้าของโทเค็นนี้.',
    color: 'green',
  },
  HAS_ADMIN_ACCESS: {
    name: 'Has admin access',
    description: 'สามารถดำเนินการด้านการดูแลระบบ เช่น การกลั่นกรอง รับสถานะเซิร์ฟเวอร์ ฯลฯ',
    color: 'red',
  },
};

function convertScopeStringToTag(scopeString: string) {
  if (!scopeString || !availableScopes[scopeString]) {
    return null;
  }

  const scope = availableScopes[scopeString];

  return (
    <Tooltip key={scopeString} title={scope.description}>
      <Tag color={scope.color}>{scope.name}</Tag>
    </Tooltip>
  );
}

interface Props {
  onCancel: () => void;
  onOk: any; // todo: make better type
  visible: boolean;
}
function NewTokenModal(props: Props) {
  const { onOk, onCancel, visible } = props;
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [name, setName] = useState('');

  const scopes = Object.keys(availableScopes).map(key => ({
    value: key,
    label: availableScopes[key].description,
  }));

  function onChange(checkedValues) {
    setSelectedScopes(checkedValues);
  }

  function saveToken() {
    onOk(name, selectedScopes);

    // Clear the modal
    setSelectedScopes([]);
    setName('');
  }

  const okButtonProps = {
    disabled: selectedScopes.length === 0 || name === '',
  };

  function selectAll() {
    setSelectedScopes(Object.keys(availableScopes));
  }
  const checkboxes = scopes.map(singleEvent => (
    <Col span={8} key={singleEvent.value}>
      <Checkbox value={singleEvent.value}>{singleEvent.label}</Checkbox>
    </Col>
  ));

  return (
    <Modal
      title="Create New Access token"
      visible={visible}
      onOk={saveToken}
      onCancel={onCancel}
      okButtonProps={okButtonProps}
    >
      <p>
        <p>ชื่อจะแสดงเป็นผู้ใช้แชทเมื่อส่งข้อความด้วยโทเค็นการเข้าถึงนี้.</p>
        <Input
          value={name}
          placeholder="Name of bot, service, or integration"
          onChange={input => setName(input.currentTarget.value)}
        />
      </p>

      <p>เลือกการอนุญาตที่โทเค็นการเข้าถึงนี้จะมี ไม่สามารถแก้ไขได้หลังจาก สร้าง.</p>
      <Checkbox.Group style={{ width: '100%' }} value={selectedScopes} onChange={onChange}>
        <Row>{checkboxes}</Row>
      </Checkbox.Group>

      <p>
        <Button type="primary" onClick={selectAll}>
          Select all
        </Button>
      </p>
    </Modal>
  );
}

export default function AccessTokens() {
  const [tokens, setTokens] = useState([]);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);

  function handleError(error) {
    console.error('error', error);
  }

  async function getAccessTokens() {
    try {
      const result = await fetchData(ACCESS_TOKENS);
      setTokens(result);
    } catch (error) {
      handleError(error);
    }
  }
  useEffect(() => {
    getAccessTokens();
  }, []);

  async function handleDeleteToken(token) {
    try {
      await fetchData(DELETE_ACCESS_TOKEN, {
        method: 'POST',
        data: { token },
      });
      getAccessTokens();
    } catch (error) {
      handleError(error);
    }
  }

  async function handleSaveToken(name: string, scopes: string[]) {
    try {
      const newToken = await fetchData(CREATE_ACCESS_TOKEN, {
        method: 'POST',
        data: { name, scopes },
      });
      setTokens(tokens.concat(newToken));
    } catch (error) {
      handleError(error);
    }
  }

  const columns = [
    {
      title: '',
      key: 'delete',
      render: (text, record) => (
        <Space size="middle">
          <Button onClick={() => handleDeleteToken(record.accessToken)} icon={<DeleteOutlined />} />
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Token',
      dataIndex: 'accessToken',
      key: 'accessToken',
      render: text => <Input.Password size="small" bordered={false} value={text} />,
    },
    {
      title: 'Scopes',
      dataIndex: 'scopes',
      key: 'scopes',
      // eslint-disable-next-line react/destructuring-assignment
      render: scopes => <>{scopes.map(scope => convertScopeStringToTag(scope))}</>,
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: lastUsed => {
        if (!lastUsed) {
          return 'Never';
        }
        const dateObject = new Date(lastUsed);
        return format(dateObject, 'P p');
      },
    },
  ];

  const showCreateTokenModal = () => {
    setIsTokenModalVisible(true);
  };

  const handleTokenModalSaveButton = (name, scopes) => {
    setIsTokenModalVisible(false);
    handleSaveToken(name, scopes);
  };

  const handleTokenModalCancel = () => {
    setIsTokenModalVisible(false);
  };

  return (
    <div>
      <Title>Access Tokens</Title>
      <Paragraph>
        โทเค็นการเข้าถึงใช้เพื่ออนุญาตให้เครื่องมือภายนอกและบุคคลที่สามดำเนินการเฉพาะบน เซิร์ฟเวอร์
        Owncast ของคุณ ควรเก็บไว้อย่างปลอดภัยและไม่รวมอยู่ในรหัสลูกค้าแทน
        ควรเก็บไว้ในเซิร์ฟเวอร์ที่คุณควบคุม
      </Paragraph>
      <Paragraph>
        อ่านเพิ่มเติมเกี่ยวกับวิธีใช้โทเค็นเหล่านี้พร้อมตัวอย่างได้ที่{' '}
        <a
          href="https://owncast.online/docs/integrations/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          our documentation
        </a>
        .
      </Paragraph>

      <Table rowKey="token" columns={columns} dataSource={tokens} pagination={false} />
      <br />
      <Button type="primary" onClick={showCreateTokenModal}>
        Create Access Token
      </Button>
      <NewTokenModal
        visible={isTokenModalVisible}
        onOk={handleTokenModalSaveButton}
        onCancel={handleTokenModalCancel}
      />
    </div>
  );
}
