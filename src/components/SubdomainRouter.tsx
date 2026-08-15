import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SubdomainRouter() {
  const navigate = useNavigate();
  const hostname = window.location.hostname;

  useEffect(() => {
    if (hostname.startsWith('app.')) {
      navigate('/app/editor', { replace: true });
    }
  }, [hostname, navigate]);

  return null;
}
