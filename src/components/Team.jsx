import React from 'react'
import useScrollReveal from '../hooks/useScrollRevealBidirectional'

function TeamCard({ member, delay }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`team-card reveal-up ${visible ? 'visible' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <div className="team-card-inner">
        <div className="team-card-front">
          <div className="team-image">
            <img src={member.image} alt={member.name} />
          </div>
          <div className="team-info">
            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>
          </div>
        </div>
        <div className="team-card-back">
          <a href={member.link} target="_blank" rel="noopener noreferrer" className="linkedin-btn" aria-label="LinkedIn Profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            View LinkedIn
          </a>
        </div>
      </div>
    </div>
  )
}

function Team() {
  const { ref: headerRef, visible: headerVis } = useScrollReveal()

  const teamMembers = [
    { name: 'Shihara Sasangi',    role: 'Co-founder | Team Leader', image: '/TeamMembers/Shihara Sasangi.jpg',      link: 'https://www.linkedin.com/in/shihara-sasangi-067353270' },
    { name: 'Achintha Ishara',    role: 'Co-founder',               image: '/TeamMembers/Ishara Gamage.jpg',        link: 'https://www.linkedin.com/in/ishara-achintha-2b1240292' },
    { name: 'Hirusha Pramuditha', role: 'Co-founder',               image: '/TeamMembers/Hirusha Pramuditha.jpg',  link: 'https://www.linkedin.com/in/hirusha-pramuditha-878943294' },
    { name: 'Vibhath Adhithya',   role: 'Co-founder',               image: '/TeamMembers/Vibhath Adithya.jpg',     link: 'https://www.linkedin.com/in/vibhath-adithya-086a43293' },
    { name: 'Chaninthu Sesanda',  role: 'Co-founder',               image: '/TeamMembers/Chaninthu Sesanda.jpg',   link: 'https://www.linkedin.com/in/chanithu-sesada-63774b305' },
    { name: 'Danindu Walisinghe', role: 'Co-founder',               image: '/TeamMembers/Danindu Walisinghe.jpg',  link: 'https://www.linkedin.com/in/danidu-walisingha-181026216' }
  ]

  return (
    <section className="team-section" id="team">
      <div className="section-container">
        <div ref={headerRef} className={`section-header reveal-up ${headerVis ? 'visible' : ''}`}>
          <p className="section-eyebrow">The Team</p>
          <h2>Meet the Team</h2>
          <p className="section-sub">The brilliant minds behind Universe3D</p>
        </div>
        <div className="team-grid">
          {teamMembers.map((m, i) => (
            <TeamCard key={i} member={m} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Team
