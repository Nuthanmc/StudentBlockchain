const AboutUs = () => {
    return (
      <div>
        <h1>About Us</h1>
        <p>This is the about page.</p>
      </div>
    );
  };
  
  export default AboutUs;

  interface TeamMember {
    name: string;
    role: string;
    bio: string;
  }
  
  // Sample data for the "About Us" page
  const aboutContent = `
    Welcome to our company! We are dedicated to providing innovative solutions 
    and exceptional service to our clients. Our mission is to empower businesses 
    through technology and creativity.
  `;
  
  const teamMembers: TeamMember[] = [
    { name: "Alice Johnson", role: "CEO", bio: "Passionate about leadership and innovation." },
    { name: "Bob Smith", role: "CTO", bio: "Expert in software development and cloud computing." },
    { name: "Charlie Davis", role: "Designer", bio: "Creative mind behind our stunning designs." },
  ];
  
  // Function to populate the "About Us" content
  function populateAboutContent() {
    const aboutContentElement = document.getElementById("about-content");
    if (aboutContentElement) {
      aboutContentElement.innerHTML = `<p>${aboutContent}</p>`;
    }
  }
  
  // Function to populate the team members list
  function populateTeamMembers() {
    const teamListElement = document.getElementById("team-list");
    if (teamListElement) {
      teamListElement.innerHTML = ""; // Clear existing content
      teamMembers.forEach((member) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <strong>${member.name}</strong> - ${member.role}<br>
          <em>${member.bio}</em>
        `;
        teamListElement.appendChild(listItem);
      });
    }
  }
  
  // Initialize the page
  document.addEventListener("DOMContentLoaded", () => {
    populateAboutContent();
    populateTeamMembers();
  });