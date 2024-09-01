import axios from "../axios-config";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Função para buscar memórias
  const getMemories = useCallback(async () => {
    try {
      const { data } = await axios.get("/memories");
      setMemories(data);
      setFilteredMemories(data);
    } catch (error) {
      toast.error("Erro ao carregar memórias.");
      console.error("Erro ao carregar memórias:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getMemories();
  }, [getMemories]);

  // Função para filtrar memórias com base em favoritos e termo de busca
  useEffect(() => {
    let filtered = memories;

    if (isFavorite) {
      filtered = filtered.filter(memory => memory.favorite);
    }

    if (searchTerm) {
      filtered = filtered.filter(memory =>
        memory.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMemories(filtered);
  }, [isFavorite, searchTerm, memories]);

  // Função para excluir uma memória
  const handleDelete = async (id) => {
    try {
      const { status, data } = await axios.delete(`/memories/${id}`);
      if (status === 200) {
        setMemories(prevMemories => prevMemories.filter(memory => memory._id !== id));
        toast.success("Memória excluída com sucesso!");
      } else {
        throw new Error(data.msg);
      }
    } catch (error) {
      toast.error("Erro ao excluir memória.");
      console.error("Erro ao excluir memória:", error);
      navigate("/");
    }
  };

  // Função para alternar o status de favorito de uma memória
  const handleFavoriteToggle = async (id) => {
    try {
      const memoryToToggle = memories.find(memory => memory._id === id);
      if (!memoryToToggle) return;

      const updatedMemories = memories.map(memory =>
        memory._id === id ? { ...memory, favorite: !memory.favorite } : memory
      );
      setMemories(updatedMemories);

      const { status, data } = await axios.patch(`/memories/favorite/${id}`);
      if (status === 200) {
        const updatedMemory = data.memory;
        setMemories(prevMemories =>
          prevMemories.map(memory =>
            memory._id === id ? updatedMemory : memory
          )
        );

        toast.success(updatedMemory.favorite ? "Adicionado aos favoritos" : "Removido dos favoritos");
      } else {
        throw new Error(data.msg);
      }
    } catch (error) {
      toast.error("Erro ao atualizar favorito.");
      console.error("Erro ao atualizar favorito:", error);
    }
  };

  if (loading) return <p className="loading">Carregando...</p>;

  return (
    <div className="home">
      <h2>Confira as últimas Memórias</h2>
      <div className="filter">
        <h2>Busca</h2>
        <div className="filters">
          <label>
            <input 
              type="checkbox" 
              checked={isFavorite} 
              onChange={(e) => setIsFavorite(e.target.checked)} 
            />
            Favoritos
          </label>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>
      {filteredMemories.length === 0 ? (
        <p className="load">Nenhuma memória encontrada.</p>
      ) : (
        <div className="memories-container">
          {filteredMemories.map((memory) => (
            <div className="memory" key={memory._id}>
              <img src={`${axios.defaults.baseURL}/${memory.src}`} alt={memory.title} />
              <div className="memory-header">
                <p className="memory-title">{memory.title}</p>
                <button 
                  onClick={() => handleFavoriteToggle(memory._id)} 
                  className={`btn-favorite ${memory.favorite ? 'filled' : 'unfilled'}`}
                >
                  <i className={`fas fa-heart ${memory.favorite ? 'filled' : 'unfilled'}`}></i>
                </button>
              </div>
              <div className="btn-div">
                <Link className="btn" to={`/memories/${memory._id}`}>Comentar</Link>
                <button onClick={() => handleDelete(memory._id)} className="btn-secondary">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
