import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from 'react-bulma-components/lib/components/button';
import Notification from 'react-bulma-components/lib/components/notification';
import Columns from 'react-bulma-components/lib/components/columns';
import Table from 'react-bulma-components/lib/components/table';
import Tag from 'react-bulma-components/lib/components/tag';

import { pad, padHex } from '../../utilities/string.js';
import buildAndRun from '../../redux/actions/buildAndRun.js';
import FramedBox from '../UI/FramedBox/FramedBox.js';
import { stop } from '../../services/emulator.js';

class General extends Component {
  state = { showStopButton: false };

  handleBuildAndRun = () => this.props.buildAndRun(this.props.editor.getValue(), 'run');

  handleBuildAndDebug = () => this.props.buildAndRun(this.props.editor.getValue(), 'debug');

  handleStop = () => stop();

  componentDidUpdate() {
    if (!this.props.emulator.running && this.state.showStopButton)
      this.setState({ showStopButton: false });
  }

  render() {
    const { emulator } = this.props;
    const { showStopButton } = this.state;
    const { running, error, registers } = emulator;
    // amount is always even, so no need to take care for last element
    const registerPairs = (registers.index || []).reduce((acc, reg, idx, ar) => idx % 2 ? [...acc, [ar[idx - 1], reg]] : acc, []);
    const stack = registers.stack || [];

    // prevent flickering for quick execution sessions
    if (running) {
      setTimeout(() => {
        if (this.props.emulator.running)
          this.setState({ showStopButton: true });
      }, 500);
    }

    return (
      <>
        { emulator.error && <Notification color="danger">{error}</Notification> }
        <div className="buttons">
          <Button color="success" onClick={this.handleBuildAndRun} disabled={running}>Build & Run</Button>
          <Button color="info" onClick={this.handleBuildAndDebug} disabled={running}>Build & Debug</Button>
          { showStopButton && <Button color="danger" onClick={this.handleStop}>Stop</Button> }
        </div>
        <Columns>
          <Columns.Column size={6}>
            <FramedBox title='Registers'>
              <Table striped={false} bordered={false}>
                <tbody>
                  {
                    registerPairs.map(([reg1, reg2], idx) =>
                      <tr key={`reg-${idx}`}>
                        <td>{padHex(reg1, 2)}</td>
                        <td><Tag>{`RR${pad(idx * 2, 2)}`}</Tag></td>
                        <td>{padHex(reg2, 2)}</td>
                        <td><Tag>{`RR${pad(idx * 2 + 1, 2)}`}</Tag></td>
                      </tr>
                    )
                  }
                </tbody>
              </Table>
            </FramedBox>
          </Columns.Column>
          <Columns.Column size={3}>
            <FramedBox title='Register pairs'>
              <Table striped={false} bordered={false}>
                <tbody>
                  {
                    registerPairs.map(([reg1, reg2], idx) =>
                      <tr key={`regPair-${idx}`}><td>{padHex((reg1 << 4) | reg2, 2)}</td><td><Tag>{`R${idx}`}</Tag></td></tr>
                    )
                  }
                </tbody>
              </Table>
            </FramedBox>
          </Columns.Column>
          <Columns.Column size={3}>
            <FramedBox title='Miscellaneous'>
              <Table striped={false} bordered={false} size='narrow'>
                <tbody>
                  <tr><td>{padHex(registers.pc || 0, 3) }</td><td><Tag>PC</Tag></td></tr>
                  <tr><td>{padHex(registers.acc || 0, 2) }</td><td><Tag>ACC</Tag></td></tr>
                  <tr><td>{padHex(registers.carry || 0, 2) }</td><td><Tag>CY</Tag></td></tr>
                  <tr><td>{padHex(registers.sp || 0, 2) }</td><td><Tag>SP</Tag></td></tr>
                  <tr><td>{padHex(stack[0] || 0, 3) }</td><td><Tag>S0</Tag></td></tr>
                  <tr><td>{padHex(stack[1] || 0, 3) }</td><td><Tag>S1</Tag></td></tr>
                  <tr><td>{padHex(stack[2] || 0, 3) }</td><td><Tag>S2</Tag></td></tr>
                </tbody>
              </Table>
            </FramedBox>
          </Columns.Column>
        </Columns>
      </>
    );
  }
}

export default connect(state => ({ editor: state.editor, dump: state.dump, emulator: state.emulator }), { buildAndRun })(General);
