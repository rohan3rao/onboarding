"use client";
import { Spinner } from 'react-bootstrap';
import './spinner.css'

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="spinner-overlay">
    <div className="spinner-container">
      <Spinner animation="border" variant="primary" /> 
      <p className="spinner-text">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;