import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [profile, setProfile] = useState({ about_text: '', profile_image_url: '' });
  const [certifications, setCertifications] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tags: '',
    github_link: '',
    live_link: '',
    kaggle_link: '',
    other_link: ''
  });
  const [newCertName, setNewCertName] = useState('');
  const [newCertLink, setNewCertLink] = useState('');
  
  const [projectFile, setProjectFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchProfile();
    fetchCertifications();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase.from('portfolio_profile').select('*').limit(1).single();
    if (data) setProfile(data);
  };

  const fetchCertifications = async () => {
    const { data, error } = await supabase.from('portfolio_certifications').select('*').order('created_at', { ascending: false });
    if (data) setCertifications(data);
  };

  const handleUpload = async (file, folder) => {
    if (!file) return null;
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
    if (uploadError) {
      console.error(uploadError);
      setIsUploading(false);
      return null;
    }

    const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
    setIsUploading(false);
    return data.publicUrl;
  };

  const resetForm = () => {
    setNewProject({ title: '', description: '', tags: '', github_link: '', live_link: '', kaggle_link: '', other_link: '' });
    setProjectFile(null);
    setEditingProjectId(null);
  };

  const handleAddOrUpdateProject = async (e) => {
    e.preventDefault();
    let mediaUrl = null;
    let isVideo = false;

    if (projectFile) {
      mediaUrl = await handleUpload(projectFile, 'projects');
      if (projectFile.type.startsWith('video/')) isVideo = true;
    }

    const projectData = {
      title: newProject.title,
      description: newProject.description,
      tags: typeof newProject.tags === 'string' ? newProject.tags.split(',').map(tag => tag.trim()) : newProject.tags,
      github_link: newProject.github_link,
      live_link: newProject.live_link,
      kaggle_link: newProject.kaggle_link,
      other_link: newProject.other_link,
    };

    if (mediaUrl) {
      projectData.image_url = !isVideo ? mediaUrl : null;
      projectData.video_url = isVideo ? mediaUrl : null;
    }

    if (editingProjectId) {
      const { error } = await supabase.from('portfolio_projects').update(projectData).eq('id', editingProjectId);
      if (!error) {
        resetForm();
        fetchProjects();
      }
    } else {
      const { error } = await supabase.from('portfolio_projects').insert([projectData]);
      if (!error) {
        resetForm();
        fetchProjects();
      }
    }
  };

  const handleEditClick = (project) => {
    setEditingProjectId(project.id);
    setNewProject({
      title: project.title || '',
      description: project.description || '',
      tags: project.tags ? project.tags.join(', ') : '',
      github_link: project.github_link || '',
      live_link: project.live_link || '',
      kaggle_link: project.kaggle_link || '',
      other_link: project.other_link || ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (!error) fetchProjects();
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    let imageUrl = profile.profile_image_url;
    let resumeUrl = profile.resume_url;

    if (profileFile) {
      const uploadedUrl = await handleUpload(profileFile, 'profile');
      if (uploadedUrl) imageUrl = uploadedUrl;
    }
    
    if (resumeFile) {
      const uploadedUrl = await handleUpload(resumeFile, 'resumes');
      if (uploadedUrl) resumeUrl = uploadedUrl;
    }

    if (profile.id) {
      await supabase.from('portfolio_profile').update({ about_text: profile.about_text, profile_image_url: imageUrl, resume_url: resumeUrl }).eq('id', profile.id);
    } else {
      await supabase.from('portfolio_profile').insert([{ about_text: profile.about_text, profile_image_url: imageUrl, resume_url: resumeUrl }]);
    }
    fetchProfile();
    alert('Profile & Resume updated successfully!');
  };

  const [editingCertId, setEditingCertId] = useState(null);
  
  const resetCertForm = () => {
    setNewCertName('');
    setNewCertLink('');
    setEditingCertId(null);
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!newCertName.trim()) return;
    
    if (editingCertId) {
      const { error } = await supabase.from('portfolio_certifications').update({ 
        name: newCertName,
        credential_url: newCertLink || null
      }).eq('id', editingCertId);
      
      if (!error) {
        resetCertForm();
        fetchCertifications();
      } else {
        alert("Error updating certification.");
      }
    } else {
      const { error } = await supabase.from('portfolio_certifications').insert([{ 
        name: newCertName,
        credential_url: newCertLink || null
      }]);
      
      if (!error) {
        resetCertForm();
        fetchCertifications();
      } else {
        alert("Error adding certification.");
      }
    }
  };

  const handleEditCertClick = (cert) => {
    setEditingCertId(cert.id);
    setNewCertName(cert.name || '');
    setNewCertLink(cert.credential_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCert = async (id) => {
    if (window.confirm("Delete this certification?")) {
      const { error } = await supabase.from('portfolio_certifications').delete().eq('id', id);
      if (!error) fetchCertifications();
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <Link to="/" className="back-link">← Back to Portfolio</Link>
      </div>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          Manage Projects
        </button>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          Manage Profile
        </button>
        <button className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => setActiveTab('certifications')}>
          Manage Certifications
        </button>
      </div>

      {activeTab === 'projects' && (
        <div className="admin-panel">
          <h2>{editingProjectId ? 'Edit Project' : 'Add New Project'}</h2>
          <form className="admin-form" onSubmit={handleAddOrUpdateProject}>
            <div className="form-group">
              <label>Project Title</label>
              <input type="text" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea required rows="4" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" placeholder="React, Node, Supabase" value={newProject.tags} onChange={e => setNewProject({...newProject, tags: e.target.value})} />
            </div>
            
            <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>GitHub Link</label>
                <input type="url" value={newProject.github_link} onChange={e => setNewProject({...newProject, github_link: e.target.value})} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Live Demo Link</label>
                <input type="url" value={newProject.live_link} onChange={e => setNewProject({...newProject, live_link: e.target.value})} />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Kaggle Link</label>
                <input type="url" value={newProject.kaggle_link} onChange={e => setNewProject({...newProject, kaggle_link: e.target.value})} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Other Link</label>
                <input type="url" value={newProject.other_link} onChange={e => setNewProject({...newProject, other_link: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Upload Media (Image or Video) {editingProjectId && "(Leave blank to keep current media)"}</label>
              <input type="file" accept="image/*,video/*" onChange={e => setProjectFile(e.target.files[0])} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="submit-btn" disabled={isUploading} style={{ flex: 1 }}>
                {isUploading ? 'Saving...' : (editingProjectId ? 'Update Project' : 'Add Project')}
              </button>
              {editingProjectId && (
                <button type="button" className="submit-btn outline" onClick={resetForm} style={{ flex: 1 }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <h2 style={{ marginTop: '50px' }}>Current Projects</h2>
          <div className="projects-grid">
            {projects.map(p => (
              <div key={p.id} className="admin-project-card">
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEditClick(p)}>
                    <Edit2 size={18} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteProject(p.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3>{p.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#aaa' }}>{p.tags?.join(', ')}</p>
                {(p.image_url || p.video_url) && (
                  p.video_url ? 
                    <video src={p.video_url} className="media-preview" muted /> : 
                    <img src={p.image_url} className="media-preview" alt={p.title} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="admin-panel">
          <h2>Update About Me & Photo</h2>
          <form className="admin-form" onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>About Me Text</label>
              <textarea required rows="6" value={profile.about_text || ''} onChange={e => setProfile({...profile, about_text: e.target.value})}></textarea>
            </div>
            <div className="form-group">
              <label>Profile Image</label>
              {profile.profile_image_url && (
                <img src={profile.profile_image_url} alt="Current profile" style={{ width: '150px', borderRadius: '10px', marginBottom: '10px' }} />
              )}
              <input type="file" accept="image/*" onChange={e => setProfileFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label>Upload Resume (PDF)</label>
              {profile.resume_url && (
                <p style={{ marginBottom: '10px', color: '#4caf50' }}>Current Resume Uploaded: <a href={profile.resume_url} target="_blank" rel="noreferrer" style={{color: '#20BEFF'}}>View File</a></p>
              )}
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files[0])} />
            </div>
            <button type="submit" className="submit-btn" disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="admin-panel">
          <h2>{editingCertId ? 'Edit Certification' : 'Add Certification'}</h2>
          <form className="admin-form" onSubmit={handleAddCert}>
            <div className="form-group">
              <label>Certification Name</label>
              <input 
                type="text" 
                required 
                placeholder="E.g. AWS Certified Developer" 
                value={newCertName} 
                onChange={e => setNewCertName(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Credential Link (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://credly.com/..." 
                  value={newCertLink} 
                  onChange={e => setNewCertLink(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end' }}>
                <button type="submit" className="submit-btn" style={{ padding: '0 30px', height: '60px' }}>
                  {editingCertId ? 'Update' : 'Add'}
                </button>
                {editingCertId && (
                  <button type="button" className="submit-btn outline" onClick={resetCertForm} style={{ padding: '0 30px', height: '60px' }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          <h2 style={{ marginTop: '50px' }}>Current Certifications</h2>
          <div className="projects-grid">
            {certifications.map(c => (
              <div key={c.id} className="admin-project-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '5px' }}>{c.name}</h3>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', color: '#20BEFF', textDecoration: 'none' }}>
                      View Credential →
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="edit-btn" onClick={() => handleEditCertClick(c)} style={{ position: 'relative', background: 'transparent', padding: '5px' }}>
                    <Edit2 size={24} color="#aaa" />
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteCert(c.id)} style={{ position: 'relative', background: 'transparent', padding: '5px' }}>
                    <Trash2 size={24} color="#dc2626" />
                  </button>
                </div>
              </div>
            ))}
            {certifications.length === 0 && (
              <p style={{ color: '#aaa' }}>No certifications in database yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
