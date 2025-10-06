 const codeElement = document.getElementById("code");

    const codeSnippet = `
<span class="keyword">import</span> { useState, useEffect } <span class="keyword">from</span> <span class="string">'react'</span>;

<span class="keyword">function</span> <span class="function">useApi</span>(<span class="variable">url</span>) {
  <span class="keyword">const</span> [<span class="variable">data</span>, setData] = useState(null);
  <span class="keyword">const</span> [<span class="variable">loading</span>, setLoading] = useState(true);
  <span class="keyword">const</span> [<span class="variable">error</span>, setError] = useState(null);

  useEffect(() => {
    <span class="keyword">async function</span> <span class="function">fetchData</span>() {
      <span class="keyword">try</span> {
        <span class="keyword">const</span> response = <span class="keyword">await</span> fetch(<span class="variable">url</span>);
        <span class="keyword">if</span> (!response.ok) {
          <span class="keyword">throw new</span> Error(\`HTTP error! Status: <span class="error-code">\${400}</span>\`);
        }
        <span class="keyword">const</span> result = <span class="keyword">await</span> response.json();
        setData(result);
      } <span class="keyword">catch</span> (err) {
        setError(err.message);
      } <span class="keyword">finally</span> {
        setLoading(false);
      }
    }
    fetchData();
  }, [<span class="variable">url</span>]);

  <span class="keyword">return</span> { <span class="variable">data</span>, <span class="variable">loading</span>, <span class="variable">error</span> };
}
`;

    let i = 0;
    let deleting = false;

    function typeCode() {
      if (!deleting) {
        codeElement.innerHTML = codeSnippet.slice(0, i);
        i++;
        if (i > codeSnippet.length) {
          deleting = true;
          setTimeout(typeCode, 1500); // wait before deleting
          return;
        }
      } else {
        codeElement.innerHTML = codeSnippet.slice(0, i);
        i--;
        if (i < 0) {
          deleting = false;
          i = 0;
        }
      }
      setTimeout(typeCode, deleting ? 10 : 30);
    }

    typeCode();


