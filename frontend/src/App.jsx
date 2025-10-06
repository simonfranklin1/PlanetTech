import { usePhoneContext } from './context/phoneChatContext'
import LiveChat from './pages/LiveChat';
import Login from './pages/login';

function App() {

  const { authenticated } = usePhoneContext();

  return (
    <div>
      {
        authenticated === true ? (
          <LiveChat />
        ) : (
          <Login />
        )
      }
    </div>
  )
}

export default App
