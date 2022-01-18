import { Col, Collapse, Row, Typography } from 'antd';
import React from 'react';
import VideoCodecSelector from '../components/config/video-codec-selector';
import VideoLatency from '../components/config/video-latency';
import VideoVariantsTable from '../components/config/video-variants-table';

const { Panel } = Collapse;
const { Title } = Typography;

export default function ConfigVideoSettings() {
  return (
    <div className="config-video-variants">
      <Title>Video configuration</Title>
      <p className="description">
        ก่อนเปลี่ยนการกำหนดค่าวิดีโอของคุณ{' '}
        <a
          href="https://pnckdevapp.com?/docs/video?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          เยี่ยมชมเอกสารวิดีโอ
        </a>{' '}
        เพื่อเรียนรู้ว่าสิ่งนี้ส่งผลต่อประสิทธิภาพการสตรีมของคุณอย่างไร
        กฎทั่วไปคือเริ่มต้นอย่างระมัดระวัง
        โดยการมีตัวแปรเอาต์พุตสตรีมคุณภาพกลางหนึ่งรายการและทดลองโดยเพิ่มความหลากหลายให้มากขึ้น
        คุณสมบัติ.
      </p>

      <Row gutter={[16, 16]}>
        <Col md={24} lg={12}>
          <div className="form-module variants-table-module">
            <VideoVariantsTable />
          </div>
        </Col>
        <Col md={24} lg={12}>
          <div className="form-module latency-module">
            <VideoLatency />
          </div>

          <Collapse className="advanced-settings codec-module">
            <Panel header="Advanced Settings" key="1">
              <div className="form-module variants-table-module">
                <VideoCodecSelector />
              </div>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  );
}
