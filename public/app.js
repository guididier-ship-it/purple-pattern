const CITIES = [
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Athens', country: 'Greece' },
  { city: 'Auckland', country: 'New Zealand' },
  { city: 'Bangkok', country: 'Thailand' },
  { city: 'Barcelona', country: 'Spain' },
  { city: 'Beijing', country: 'China' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Bogotá', country: 'Colombia' },
  { city: 'Brussels', country: 'Belgium' },
  { city: 'Budapest', country: 'Hungary' },
  { city: 'Buenos Aires', country: 'Argentina' },
  { city: 'Cairo', country: 'Egypt' },
  { city: 'Cape Town', country: 'South Africa' },
  { city: 'Casablanca', country: 'Morocco' },
  { city: 'Chicago', country: 'United States' },
  { city: 'Copenhagen', country: 'Denmark' },
  { city: 'Delhi', country: 'India' },
  { city: 'Dubai', country: 'United Arab Emirates' },
  { city: 'Dublin', country: 'Ireland' },
  { city: 'Edinburgh', country: 'United Kingdom' },
  { city: 'Florence', country: 'Italy' },
  { city: 'Hanoi', country: 'Vietnam' },
  { city: 'Havana', country: 'Cuba' },
  { city: 'Helsinki', country: 'Finland' },
  { city: 'Ho Chi Minh City', country: 'Vietnam' },
  { city: 'Hong Kong', country: 'China' },
  { city: 'Iguazu', country: 'Argentina' },
  { city: 'Istanbul', country: 'Turkey' },
  { city: 'Jakarta', country: 'Indonesia' },
  { city: 'Jerusalem', country: 'Israel' },
  { city: 'Johannesburg', country: 'South Africa' },
  { city: 'Kyoto', country: 'Japan' },
  { city: 'Lagos', country: 'Nigeria' },
  { city: 'Lima', country: 'Peru' },
  { city: 'Lisbon', country: 'Portugal' },
  { city: 'London', country: 'United Kingdom' },
  { city: 'Los Angeles', country: 'United States' },
  { city: 'Madrid', country: 'Spain' },
  { city: 'Marrakech', country: 'Morocco' },
  { city: 'Melbourne', country: 'Australia' },
  { city: 'Mexico City', country: 'Mexico' },
  { city: 'Milan', country: 'Italy' },
  { city: 'Montreal', country: 'Canada' },
  { city: 'Moscow', country: 'Russia' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Munich', country: 'Germany' },
  { city: 'Nairobi', country: 'Kenya' },
  { city: 'New York', country: 'United States' },
  { city: 'Oslo', country: 'Norway' },
  { city: 'Paris', country: 'France' },
  { city: 'Prague', country: 'Czech Republic' },
  { city: 'Queenstown', country: 'New Zealand' },
  { city: 'Reykjavik', country: 'Iceland' },
  { city: 'Rio de Janeiro', country: 'Brazil' },
  { city: 'Rome', country: 'Italy' },
  { city: 'San Francisco', country: 'United States' },
  { city: 'Santiago', country: 'Chile' },
  { city: 'São Paulo', country: 'Brazil' },
  { city: 'Seoul', country: 'South Korea' },
  { city: 'Shanghai', country: 'China' },
  { city: 'Singapore', country: 'Singapore' },
  { city: 'Stockholm', country: 'Sweden' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Taipei', country: 'Taiwan' },
  { city: 'Tehran', country: 'Iran' },
  { city: 'Tel Aviv', country: 'Israel' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Vancouver', country: 'Canada' },
  { city: 'Venice', country: 'Italy' },
  { city: 'Vienna', country: 'Austria' },
  { city: 'Warsaw', country: 'Poland' },
  { city: 'Zurich', country: 'Switzerland' },
];

const input = document.getElementById('cityInput');
const dropdown = document.getElementById('dropdown');
const generateBtn = document.getElementById('generateBtn');
const placeholder = document.getElementById('placeholder');
const loader = document.getElementById('loader');
const result = document.getElementById('result');
const resultImage = document.getElementById('resultImage');
const resultCity = document.getElementById('resultCity');
const downloadPng = document.getElementById('downloadPng');

let selectedEntry = null;
let activeIndex = -1;
let filteredCities = [];
let cityPrompts = null;

// Load city prompt config
fetch('/city-prompts.json')
  .then(r => r.json())
  .then(data => { cityPrompts = data; })
  .catch(err => console.error('Failed to load city prompts:', err));

function buildPrompt(city, country) {
  if (!cityPrompts) {
    return `Seamless flat bold duotone geometric tile pattern inspired by ${city}, ${country}. Fully abstract, no figurative elements, no text. Include 5-10% accent purple #824cff. No gradients, no shadows. Output: seamless tileable PNG.`;
  }

  const cityData = cityPrompts[city];

  if (!cityData) {
    return `Seamless flat bold duotone geometric tile pattern inspired by the architectural and decorative traditions of ${city}, ${country}. Fully abstract geometric motif. Include 5-10% accent purple #824cff. No gradients, no shadows, no figurative elements, no text. Output: seamless tileable PNG.`;
  }

  return cityData.prompt_for_image_model;
}

function highlightMatch(city, query) {
  const idx = city.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return city;
  return (
    city.slice(0, idx) +
    '<mark>' + city.slice(idx, idx + query.length) + '</mark>' +
    city.slice(idx + query.length)
  );
}

function renderDropdown(query) {
  if (!query) {
    dropdown.classList.remove('open');
    filteredCities = [];
    return;
  }

  const q = query.toLowerCase();
  filteredCities = CITIES.filter(c =>
    c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  );

  if (filteredCities.length === 0) {
    dropdown.classList.remove('open');
    return;
  }

  dropdown.innerHTML = filteredCities
    .map((entry, i) =>
      `<div class="dropdown-item${i === activeIndex ? ' active' : ''}" data-index="${i}">${highlightMatch(entry.city, query)} <span class="dropdown-country">${entry.country}</span></div>`
    )
    .join('');

  dropdown.classList.add('open');
}

function selectCity(entry) {
  selectedEntry = entry;
  input.value = `${entry.city}, ${entry.country}`;
  dropdown.classList.remove('open');
  activeIndex = -1;
  generateBtn.disabled = false;
}

// Input events
input.addEventListener('input', () => {
  selectedEntry = null;
  generateBtn.disabled = true;
  activeIndex = -1;
  renderDropdown(input.value.trim());
});

input.addEventListener('keydown', (e) => {
  if (!dropdown.classList.contains('open')) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex = Math.min(activeIndex + 1, filteredCities.length - 1);
    renderDropdown(input.value.trim());
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex = Math.max(activeIndex - 1, 0);
    renderDropdown(input.value.trim());
  } else if (e.key === 'Enter' && activeIndex >= 0) {
    e.preventDefault();
    selectCity(filteredCities[activeIndex]);
  }
});

dropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.dropdown-item');
  if (!item) return;
  const idx = parseInt(item.dataset.index);
  selectCity(filteredCities[idx]);
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.input-wrapper')) {
    dropdown.classList.remove('open');
  }
});

// Generate
generateBtn.addEventListener('click', async () => {
  if (!selectedEntry) return;

  const { city, country } = selectedEntry;
  const prompt = buildPrompt(city, country);

  // Show loader
  placeholder.classList.add('hidden');
  result.classList.add('hidden');
  loader.classList.remove('hidden');
  generateBtn.disabled = true;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Generation failed');
    }

    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) throw new Error('No image returned');

    const slug = city.toLowerCase().replace(/\s+/g, '-');

    resultImage.src = imageUrl;
    resultCity.textContent = `${city}, ${country}`;

    // PNG download
    downloadPng.href = imageUrl;
    downloadPng.download = `purple-pattern-${slug}.png`;

    loader.classList.add('hidden');
    result.classList.remove('hidden');
    result.style.display = 'flex';
  } catch (err) {
    console.error(err);
    loader.classList.add('hidden');
    placeholder.classList.remove('hidden');
    placeholder.querySelector('p').textContent = `Error: ${err.message}`;
  } finally {
    generateBtn.disabled = false;
  }
});
