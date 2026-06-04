import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { projects as fallbackProjects } from '../constants';
import { ExternalLink, X } from 'lucide-react';
import { FaGithub, FaKaggle } from 'react-icons/fa';
import './Projects.css';

import ScrollReveal from './ScrollReveal';

const Projects = () => {
  const [dbProjects, setDbProjects] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [modalMousePos, setModalMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setDbProjects(data);
    }
  };

  const displayProjects = dbProjects.length > 0 ? dbProjects : fallbackProjects.map((p, i) => ({ ...p, id: i }));

  // Extract unique tags for the filter
  const allTags = displayProjects.reduce((acc, project) => {
    project.tags.forEach(tag => {
      if (!acc.includes(tag)) acc.push(tag);
    });
    return acc;
  }, []);
  
  // Take top 6 tags to keep UI clean
  const topTags = ['All', ...allTags.slice(0, 6)];

  const filteredProjects = activeFilter === 'All' 
    ? displayProjects 
    : displayProjects.filter(p => p.tags.includes(activeFilter));

  const handleModalMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    setModalMousePos({ x, y });
  };

  return (
    <section id="projects" className="projects-section">
      <svg className="torn-top" viewBox="0 0 1000 20" preserveAspectRatio="none">
        <path d="M0,20 L0,10 L50,15 L100,5 L150,12 L200,2 L250,18 L300,8 L350,16 L400,4 L450,14 L500,6 L550,18 L600,3 L650,15 L700,7 L750,19 L800,2 L850,12 L900,5 L950,17 L1000,9 L1000,20 Z" fill="var(--bg-dark)" />
      </svg>
      <div className="section-padding" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <ScrollReveal delay={0.1}>
          <h2 className="projects-heading torn-text" data-text="FEATURED PROJECTS">FEATURED PROJECTS</h2>
        </ScrollReveal>
        
        {/* Interactive Filters */}
        <ScrollReveal delay={0.2}>
          <div className="project-filters">
            {topTags.map(tag => (
              <button 
                key={tag} 
                className={`filter-btn ${activeFilter === tag ? 'active' : ''}`}
                onClick={() => setActiveFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </ScrollReveal>
        
        <div className="projects-list">
          {filteredProjects.map((project, idx) => (
            <ScrollReveal key={project.id} delay={0.1 + (idx * 0.1)}>
              <div 
                className="project-row fade-in-row"
                onClick={() => setSelectedProject(project)}
              >
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div 
                className="project-image-container"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {hoveredId === project.id && project.video_url ? (
                  <video src={project.video_url} autoPlay loop muted className="project-media" />
                ) : project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="project-media" />
                ) : (
                  <div className="project-image-placeholder">
                    <span>{project.title.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="hover-overlay">
                  <span className="view-details-btn">View Details</span>
                </div>
              </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedProject && (
        <div className="project-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div 
            className="project-modal-content" 
            onClick={e => e.stopPropagation()}
            onMouseMove={handleModalMouseMove}
            style={{ transform: `perspective(1000px) rotateX(${modalMousePos.y * -3}deg) rotateY(${modalMousePos.x * 3}deg) scale(1)` }}
          >
            <button className="close-modal" onClick={() => setSelectedProject(null)}><X size={24} /></button>
            
            {selectedProject.video_url ? (
              <video src={selectedProject.video_url} autoPlay loop muted controls className="modal-media" />
            ) : selectedProject.image_url ? (
              <img src={selectedProject.image_url} alt={selectedProject.title} className="modal-media" />
            ) : null}

            <div className="modal-info">
              <h2>{selectedProject.title}</h2>
              <div className="modal-tags">
                {selectedProject.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <p>{selectedProject.description}</p>
              
              <div className="modal-links">
                {selectedProject.github_link && (
                  <a href={selectedProject.github_link} target="_blank" rel="noopener noreferrer" className="modal-btn outline">
                    <FaGithub size={20} /> GitHub Repo
                  </a>
                )}
                {selectedProject.kaggle_link && (
                  <a href={selectedProject.kaggle_link} target="_blank" rel="noopener noreferrer" className="modal-btn outline" style={{ color: '#20BEFF', borderColor: '#20BEFF' }}>
                    <FaKaggle size={20} /> Kaggle
                  </a>
                )}
                {selectedProject.other_link && (
                  <a href={selectedProject.other_link} target="_blank" rel="noopener noreferrer" className="modal-btn outline">
                    <ExternalLink size={20} /> Link
                  </a>
                )}
                {selectedProject.live_link && (
                  <a href={selectedProject.live_link} target="_blank" rel="noopener noreferrer" className="modal-btn solid">
                    <ExternalLink size={20} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
