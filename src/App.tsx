import './App.css'
import { Routes, Route } from 'react-router-dom';
import Start from './features/start';
import NavLeft from './features/nav_left/navLeft';
import TopicCard from './features/topic_card/topicCard';
import ContentView from './features/content_view/contentView';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          This site is based on the data from &nbsp; 
          <a
            className="App-link"
            href="https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm?Lang=E"
            target="_blank"
            rel="noopener noreferrer"
          >
            Statistics Canada - Census Profile - 2021 Census of Population
          </a>
        </p>
      </header>
      <div className='container-fluid text-start'>
        <div className='row'>
          <div className='col-lg-2'>
            <NavLeft />
          </div>
          <div className='col-lg-10'>
            <Routes>
              <Route path='/' 
                element={<Start></Start>}>
              </Route>
              <Route path='/topic' 
                element={<TopicCard></TopicCard>}>
              </Route>
              <Route path='/view' 
                element={<ContentView></ContentView>}>
              </Route>
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
    
}

export default App
