import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showToast = (type, text1, text2) => {
  const options = {
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
    style: {
      width: '90%',
      maxWidth: '400px',
      borderRadius: '10px',
      margin: '10px auto',
      padding: '15px',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px',
    },
  };

  const content = (
    <div>
      <div>{text1}</div>
      {text2 && <div style={{ fontWeight: 'normal', fontSize: '14px', marginTop: '5px' }}>{text2}</div>}
    </div>
  );

  switch (type) {
    case 'success':
      toast.success(content, {
        ...options,
        style: { ...options.style, backgroundColor: '#4BB543' },
      });
      break;
    case 'error':
      toast.error(content, {
        ...options,
        style: { ...options.style, backgroundColor: '#FF3333' },
      });
      break;
    default:
      toast(content, options);
  }
};