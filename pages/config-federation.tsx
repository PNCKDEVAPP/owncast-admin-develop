/* eslint-disable react/no-unescaped-entities */
import { Typography, Modal, Button, Row, Col } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  TEXTFIELD_TYPE_TEXT,
  TEXTFIELD_TYPE_TEXTAREA,
  TEXTFIELD_TYPE_URL,
} from '../components/config/form-textfield';
import TextFieldWithSubmit from '../components/config/form-textfield-with-submit';
import ToggleSwitch from '../components/config/form-toggleswitch';
import EditValueArray from '../components/config/edit-string-array';
import { UpdateArgs } from '../types/config-section';
import {
  FIELD_PROPS_ENABLE_FEDERATION,
  TEXTFIELD_PROPS_FEDERATION_LIVE_MESSAGE,
  TEXTFIELD_PROPS_FEDERATION_DEFAULT_USER,
  FIELD_PROPS_FEDERATION_IS_PRIVATE,
  FIELD_PROPS_SHOW_FEDERATION_ENGAGEMENT,
  TEXTFIELD_PROPS_FEDERATION_INSTANCE_URL,
  FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS,
  postConfigUpdateToAPI,
  RESET_TIMEOUT,
  API_FEDERATION_BLOCKED_DOMAINS,
  FIELD_PROPS_FEDERATION_NSFW,
} from '../utils/config-constants';
import { ServerStatusContext } from '../utils/server-status-context';
import { createInputStatus, STATUS_ERROR, STATUS_SUCCESS } from '../utils/input-statuses';

function FederationInfoModal({ cancelPressed, okPressed }) {
  return (
    <Modal
      width="70%"
      title="Enable Social Features"
      visible
      onCancel={cancelPressed}
      footer={
        <div>
          <Button onClick={cancelPressed}>ไม่เปิดใช้งาน</Button>
          <Button type="primary" onClick={okPressed}>
            เปิดใช้งานคุณสมบัติโซเชียล
          </Button>
        </div>
      }
    >
      <Typography.Title level={3}>ฟีเจอร์โซเชียลของ UFAXLIVE ทำงานอย่างไร?</Typography.Title>
      <Typography.Paragraph>
        UFAXLIVE's คุณสมบัติทางสังคมทำได้โดยให้เซิร์ฟเวอร์ของคุณเข้าร่วมThe{' '}
        <a href="https://en.wikipedia.org/wiki/Fediverse" rel="noopener noreferrer" target="_blank">
          Fediverse
        </a>
        , คอลเล็กชันเซิร์ฟเวอร์อิสระแบบกระจายอำนาจ เปิดกว้าง เช่นเดียวกับของคุณ.
      </Typography.Paragraph>
      Please{' '}
      <a href="https://pnckdevapp.com?/docs/social" rel="noopener noreferrer" target="_blank">
        read more
      </a>{' '}
      เกี่ยวกับคุณลักษณะเหล่านี้ รายละเอียดเบื้องหลัง และวิธีการทำงาน
      <Typography.Paragraph />
      <Typography.Title level={3}>สิ่งที่คุณต้องรู้?</Typography.Title>
      <ul>
        <li>
          คุณลักษณะเหล่านี้เป็นแบรนด์ใหม่ เนื่องจากความแปรปรวนของการเชื่อมต่อกับส่วนที่เหลือของ
          โลกข้อบกพร่องเป็นไปได้ โปรดรายงานสิ่งที่คุณคิดว่าไม่ถูกต้องนัก
        </li>
        <li>คุณต้องโฮสต์เซิร์ฟเวอร์ UFAXLIVE ของคุณด้วย SSL โดยใช้ https url เสมอ</li>
        <li>
          คุณไม่ควรเปลี่ยนชื่อเซิร์ฟเวอร์หรือชื่อผู้ใช้โซเชียลของคุณเมื่อมีคนเริ่มติดตาม คุณ
          เนื่องจากคุณจะถูกมองว่าเป็นผู้ใช้ที่ต่างไปจากเดิมอย่างสิ้นเชิงใน Fediverse และผู้ใช้เก่า
          จะหายไป.
        </li>
        <li>
          การเปิด <i>โหมดส่วนตัว</i> จะทำให้คุณสามารถอนุมัติผู้ติดตามและจำกัดแต่ละคนได้ด้วยตนเอง
          การมองเห็นโพสต์ของคุณสำหรับผู้ติดตามเท่านั้น
        </li>
      </ul>
      <Typography.Title level={3}>Learn more about The Fediverse</Typography.Title>
      <Typography.Paragraph>
        หากแนวคิดเหล่านี้เป็นแนวคิดใหม่ คุณควรค้นพบเพิ่มเติมว่าฟังก์ชันนี้จำเป็นอย่างไร เสนอ. เยี่ยม{' '}
        <a href="https://pnckdevapp.com?/docs/social" rel="noopener noreferrer" target="_blank">
          our documentation
        </a>{' '}
        เพื่อชี้ไปที่แหล่งข้อมูลบางอย่างที่จะช่วยให้คุณเริ่มต้นใช้งาน
      </Typography.Paragraph>
    </Modal>
  );
}

FederationInfoModal.propTypes = {
  cancelPressed: PropTypes.func.isRequired,
  okPressed: PropTypes.func.isRequired,
};

export default function ConfigFederation() {
  const { Title } = Typography;
  const [formDataValues, setFormDataValues] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig, setFieldInConfigState } = serverStatusData || {};
  const [blockedDomainSaveState, setBlockedDomainSaveState] = useState(null);

  const { federation, yp, instanceDetails } = serverConfig;
  const { enabled, isPrivate, username, goLiveMessage, showEngagement, blockedDomains } =
    federation;
  const { instanceUrl } = yp;
  const { nsfw } = instanceDetails;

  const handleFieldChange = ({ fieldName, value }: UpdateArgs) => {
    setFormDataValues({
      ...formDataValues,
      [fieldName]: value,
    });
  };

  const handleEnabledSwitchChange = (value: boolean) => {
    if (!value) {
      setFormDataValues({
        ...formDataValues,
        enabled: false,
      });
    } else {
      setIsInfoModalOpen(true);
    }
  };

  // if instanceUrl is empty, we should also turn OFF the `enabled` field of directory.
  const handleSubmitInstanceUrl = () => {
    const hasInstanceUrl = formDataValues.instanceUrl !== '';
    const isInstanceUrlSecure = formDataValues.instanceUrl.startsWith('https://');

    if (!hasInstanceUrl || !isInstanceUrlSecure) {
      postConfigUpdateToAPI({
        apiPath: FIELD_PROPS_ENABLE_FEDERATION.apiPath,
        data: { value: false },
      });
      setFormDataValues({
        ...formDataValues,
        enabled: false,
      });
    }
  };

  function federationInfoModalCancelPressed() {
    setIsInfoModalOpen(false);
    setFormDataValues({
      ...formDataValues,
      enabled: false,
    });
  }

  function federationInfoModalOkPressed() {
    setIsInfoModalOpen(false);
    setFormDataValues({
      ...formDataValues,
      enabled: true,
    });
  }

  function resetBlockedDomainsSaveState() {
    setBlockedDomainSaveState(null);
  }

  function saveBlockedDomains() {
    try {
      postConfigUpdateToAPI({
        apiPath: API_FEDERATION_BLOCKED_DOMAINS,
        data: { value: formDataValues.blockedDomains },
        onSuccess: () => {
          setFieldInConfigState({
            fieldName: 'forbiddenUsernames',
            value: formDataValues.forbiddenUsernames,
          });
          setBlockedDomainSaveState(STATUS_SUCCESS);
          setTimeout(resetBlockedDomainsSaveState, RESET_TIMEOUT);
        },
        onError: (message: string) => {
          setBlockedDomainSaveState(createInputStatus(STATUS_ERROR, message));
          setTimeout(resetBlockedDomainsSaveState, RESET_TIMEOUT);
        },
      });
    } catch (e) {
      console.error(e);
      setBlockedDomainSaveState(STATUS_ERROR);
    }
  }

  function handleDeleteBlockedDomain(index: number) {
    formDataValues.blockedDomains.splice(index, 1);
    saveBlockedDomains();
  }

  function handleCreateBlockedDomain(domain: string) {
    let newDomain;
    try {
      const u = new URL(domain);
      newDomain = u.host;
    } catch (_) {
      newDomain = domain;
    }

    formDataValues.blockedDomains.push(newDomain);
    handleFieldChange({
      fieldName: 'blockedDomains',
      value: formDataValues.blockedDomains,
    });
    saveBlockedDomains();
  }

  useEffect(() => {
    setFormDataValues({
      enabled,
      isPrivate,
      username,
      goLiveMessage,
      showEngagement,
      blockedDomains,
      nsfw,
      instanceUrl: yp.instanceUrl,
    });
  }, [serverConfig, yp]);

  if (!formDataValues) {
    return null;
  }

  const hasInstanceUrl = instanceUrl !== '';
  const isInstanceUrlSecure = instanceUrl.startsWith('https://');

  return (
    <div>
      <Title>กำหนดค่าคุณสมบัติทางสังคม</Title>
      <p>
        UFAXLIVE ช่วยให้ผู้คนสามารถติดตามและมีส่วนร่วมกับอินสแตนซ์ของคุณ มันเป็น
        วิธีที่ยอดเยี่ยมในการโปรโมตการแจ้งเตือน การแบ่งปัน และการมีส่วนร่วมของสตรีมของคุณ
      </p>
      <p>
        เมื่อเปิดใช้งานแล้วคุณจะแจ้งเตือนผู้ติดตามของคุณเมื่อคุณถ่ายทอดสดและได้รับความสามารถในการ
        เขียนโพสต์ที่กำหนดเองเพื่อแบ่งปันข้อมูลใด ๆ ที่คุณต้องการ
      </p>
      <p>
        <a href="https://pnckdevapp.com?/docs/social" rel="noopener noreferrer" target="_blank">
          อ่านเพิ่มเติมเกี่ยวกับคุณลักษณะเฉพาะของโซเชียลเหล่านี้
        </a>
      </p>
      <Row>
        <Col span={15} className="form-module" style={{ marginRight: '15px' }}>
          <ToggleSwitch
            fieldName="enabled"
            onChange={handleEnabledSwitchChange}
            {...FIELD_PROPS_ENABLE_FEDERATION}
            checked={formDataValues.enabled}
            disabled={!hasInstanceUrl || !isInstanceUrlSecure}
          />
          <TextFieldWithSubmit
            fieldName="instanceUrl"
            {...TEXTFIELD_PROPS_FEDERATION_INSTANCE_URL}
            value={formDataValues.instanceUrl}
            initialValue={yp.instanceUrl}
            type={TEXTFIELD_TYPE_URL}
            onChange={handleFieldChange}
            onSubmit={handleSubmitInstanceUrl}
          />
          <ToggleSwitch
            fieldName="isPrivate"
            {...FIELD_PROPS_FEDERATION_IS_PRIVATE}
            checked={formDataValues.isPrivate}
            disabled={!enabled}
          />
          <ToggleSwitch
            fieldName="nsfw"
            useSubmit
            {...FIELD_PROPS_FEDERATION_NSFW}
            checked={formDataValues.nsfw}
            disabled={!hasInstanceUrl}
          />
          <TextFieldWithSubmit
            required
            fieldName="username"
            type={TEXTFIELD_TYPE_TEXT}
            {...TEXTFIELD_PROPS_FEDERATION_DEFAULT_USER}
            value={formDataValues.username}
            initialValue={username}
            onChange={handleFieldChange}
            disabled={!enabled}
          />
          <TextFieldWithSubmit
            fieldName="goLiveMessage"
            {...TEXTFIELD_PROPS_FEDERATION_LIVE_MESSAGE}
            type={TEXTFIELD_TYPE_TEXTAREA}
            value={formDataValues.goLiveMessage}
            initialValue={goLiveMessage}
            onChange={handleFieldChange}
            disabled={!enabled}
          />
          <ToggleSwitch
            fieldName="showEngagement"
            {...FIELD_PROPS_SHOW_FEDERATION_ENGAGEMENT}
            checked={formDataValues.showEngagement}
            disabled={!enabled}
          />
        </Col>
        <Col span={8} className="form-module">
          <EditValueArray
            title={FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS.label}
            placeholder={FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS.placeholder}
            description={FIELD_PROPS_FEDERATION_BLOCKED_DOMAINS.tip}
            values={formDataValues.blockedDomains}
            handleDeleteIndex={handleDeleteBlockedDomain}
            handleCreateString={handleCreateBlockedDomain}
            submitStatus={createInputStatus(blockedDomainSaveState)}
          />
        </Col>
      </Row>
      {isInfoModalOpen && (
        <FederationInfoModal
          cancelPressed={federationInfoModalCancelPressed}
          okPressed={federationInfoModalOkPressed}
        />
      )}
    </div>
  );
}
