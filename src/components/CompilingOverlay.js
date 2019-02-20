import React from 'react';
import { connect } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';

const CompilingOverlay = ({ children, isCompiling }) => (
  <LoadingOverlay active={isCompiling} spinner text='Compiling...'>
    {children}
  </LoadingOverlay>
);

export default connect(state => ({ isCompiling: state.compiling }))(CompilingOverlay);
