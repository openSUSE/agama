import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';

function ProductsList({ products }) {
  const list = products.map(p => (<li key={p.id}>{p.name}</li>));

  return (
    <ul>{list}</ul>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [locales, setLocales] = useState([])
  const { lastMessage } = useWebSocket("ws://127.0.0.1:3000/ws");

  useEffect(() => {
    const loadProducts = async () => {
      fetch('http://localhost:3000/products').then(response => response.json()).then(setProducts);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const data = {
      service: "org.opensuse.Agama1",
      path: "/org/opensuse/Agama1/Locale",
      method: "ListLocales",
      iface: "org.opensuse.Agama1.Locale"
    };
    const loadLocales = async () => {
      fetch("http://localhost:3000/dbus/call", {
        body: JSON.stringify(data),
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      })
        .then(response => response.json())
        .then(([locales]) => setLocales(locales));
    }

    loadLocales();
  }, []);

  return (
    <>
      <p>Supported products:</p>
      <ProductsList products={products} />
      <p>Last message: {lastMessage?.data}</p>
      <p>Supported locales: {locales?.length}</p>
    </>
  );
}

export default App;
