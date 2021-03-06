import System from '../../../libs/emulator/system.js';

let system;
let breakpoints = {};

const sendState = () =>
  postMessage({ command: 'state', registers: system.registers, ram: system.memory, selectedBank: system.selectedBank });

const commands = {
  run: ({ mode, dump }) => {
    if (mode !== 'debug' && mode !== 'run')
      throw 'Unknown emulator mode';

    system = new System(dump);

    system.on('output', ({ type, address, data }) => postMessage({ command: 'IOOutput', type, address, data }));

    sendState();

    if (mode === 'run') {
      while (!system.isFinished())
        system.instruction();

      sendState();
      postMessage({ command: 'finish' });
    }
  },

  stop: () => {
    system = null;
    postMessage({ command: 'finish' });
  },

  continue: () => {
    while (!system.isFinished()) {
      system.instruction();

      if (breakpoints[system.registers.pc])
        return sendState();
    }

    sendState();
    postMessage({ command: 'finish' });
  },

  stepInto: () => {
    if (!system.isFinished()) {
      system.instruction();
      sendState();
    } else
      postMessage({ command: 'finish' });
  },

  stepOver: () => {
    const currentNestingLevel = system.registers.sp;
    if (!system.isFinished()) {
      system.instruction();
      while (currentNestingLevel !== system.registers.sp) {
        if (system.isFinished()) {
          sendState();
          postMessage({ command: 'finish' });
          return;
        }
        system.instruction();
      }
      sendState();
    } else
      postMessage({ command: 'finish' });
  },

  breakpoints: ({ breakpoints: inputBreakpoints }) => {
    breakpoints = inputBreakpoints;
  }
};

onmessage = ({ data: { command, ...args } }) => {
  try {
    if (!commands[command])
      return postMessage({ command, error: 'Unknown command' });

    commands[command](args);
  } catch (err) {
    postMessage({ command, error: err.toString() });
  }
};
