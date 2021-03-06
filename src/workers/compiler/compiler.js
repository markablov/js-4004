import parse from '../../../libs/parser/parser.js';

onmessage = ({ data: sourceCode }) => {
  const { data, errors } = parse(sourceCode);

  postMessage({
    dump: data,
    errors: errors.map(({ message, token, line, column }) => ({
      text: message,
      row: (token ? token.startLine : line) - 1,
      column: token ? token.startColumn : column
    }))
  });
};
