"use client";
import { useEffect } from 'react';
import Script from 'next/script';

const BootstrapScripts = () => {
  useEffect(() => {
    // This is just to ensure that the scripts are loaded
    console.log('Bootstrap and jQuery scripts loaded');
  }, []);

  return (
    <>
      <Script
        src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
        integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      ></Script>
      <Script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"
        integrity="sha384-pzjw8f+ua7Kw1TIqjVMfR9kR2Uzs9SBzDQnOZfZWmGuwDh3mtinI1wKk8F1ZO6lK"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      ></Script>
      <Script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"
        integrity="sha384-B4gt1jrGC7Jh4AgG630PgsbDr5SG1lpz73m95gboH/wbXKfdHEbZZXRfs/n9gI"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      ></Script>
    </>
  );
};

export default BootstrapScripts;