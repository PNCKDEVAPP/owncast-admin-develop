import { Popconfirm, Button, Typography } from 'antd';
import { useContext, useState } from 'react';
import { AlertMessageContext } from '../../utils/alert-message-context';

import { API_YP_RESET, fetchData } from '../../utils/apis';
import { RESET_TIMEOUT } from '../../utils/config-constants';
import {
  createInputStatus,
  STATUS_ERROR,
  STATUS_PROCESSING,
  STATUS_SUCCESS,
} from '../../utils/input-statuses';
import FormStatusIndicator from './form-status-indicator';

export default function ResetYP() {
  const { setMessage } = useContext(AlertMessageContext);

  const [submitStatus, setSubmitStatus] = useState(null);
  let resetTimer = null;
  const resetStates = () => {
    setSubmitStatus(null);
    resetTimer = null;
    clearTimeout(resetTimer);
  };

  const resetDirectoryRegistration = async () => {
    setSubmitStatus(createInputStatus(STATUS_PROCESSING));
    try {
      await fetchData(API_YP_RESET);
      setMessage('');
      setSubmitStatus(createInputStatus(STATUS_SUCCESS));
      resetTimer = setTimeout(resetStates, RESET_TIMEOUT);
    } catch (error) {
      setSubmitStatus(createInputStatus(STATUS_ERROR, `There was an error: ${error}`));
      resetTimer = setTimeout(resetStates, RESET_TIMEOUT);
    }
  };

  return (
    <>
      <Typography.Title level={3} className="section-title">
        Reset Directory
      </Typography.Title>
      <p className="description">
        หากคุณกำลังประสบปัญหากับรายชื่อของคุณใน Owncast Directory และถูกขอให้ &quot;รีเซ็ต&quot;
        การเชื่อมต่อกับบริการของคุณ คุณสามารถทำได้ที่นี่ ครั้งต่อไปที่คุณไป สด
        จะพยายามลงทะเบียนเซิร์ฟเวอร์ของคุณใหม่ด้วยไดเรกทอรีตั้งแต่เริ่มต้น
      </p>

      <Popconfirm
        placement="topLeft"
        title="Are you sure you want to reset your connection to the Owncast directory?"
        onConfirm={resetDirectoryRegistration}
        okText="Yes"
        cancelText="No"
      >
        <Button type="primary">Reset Directory Connection</Button>
      </Popconfirm>
      <p>
        <FormStatusIndicator status={submitStatus} />
      </p>
    </>
  );
}
