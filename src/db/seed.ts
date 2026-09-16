import { db } from './database.js';

export interface MovieSeed {
  id: string;
  tmdb_id: number;
  title: string;
  year: number;
  runtime_minutes: number;
  genres: string[];
  moods: string[];
  overview: string;
  poster_url: string;
  backdrop_url: string;
  streaming_platforms: string[];
  rating: number;
  director: string;
  cast_members: string[];
  quote: string;
  trailer_url: string;
}

export interface MoodPresetSeed {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  seed_filters: {
    mood_tags: string[];
    genre_tags: string[];
    platform_filters?: string[];
    max_runtime_minutes?: number;
  };
  sample_movie_ids: string[];
}

export const moviesList: MovieSeed[] = [
  // Mind-Bending Sci-Fi
  {
    id: 'interstellar-2014',
    tmdb_id: 157336,
    title: 'Interstellar',
    year: 2014,
    runtime_minutes: 169,
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    moods: ['mind-bending', 'emotional', 'epic', 'philosophical', 'awe-inspiring'],
    overview: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    streaming_platforms: ['Prime Video', 'Paramount+'],
    rating: 8.7,
    director: 'Christopher Nolan',
    cast_members: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    quote: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.",
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E'
  },
  {
    id: 'inception-2010',
    tmdb_id: 27205,
    title: 'Inception',
    year: 2010,
    runtime_minutes: 148,
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    moods: ['mind-bending', 'tense', 'slick', 'intellectual', 'cerebral'],
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    poster_url: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 8.8,
    director: 'Christopher Nolan',
    cast_members: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    quote: "An idea is like a virus. Resilient. Highly contagious.",
    trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0'
  },
  {
    id: 'blade-runner-2049-2017',
    tmdb_id: 335984,
    title: 'Blade Runner 2049',
    year: 2017,
    runtime_minutes: 164,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    moods: ['atmospheric', 'melancholic', 'philosophical', 'neon', 'slow-burn'],
    overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    poster_url: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg',
    streaming_platforms: ['Max', 'Hulu'],
    rating: 8.0,
    director: 'Denis Villeneuve',
    cast_members: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
    quote: "All the best memories are hers.",
    trailer_url: 'https://www.youtube.com/watch?v=gCcx85zbxz4'
  },
  {
    id: 'everything-everywhere-2022',
    tmdb_id: 545611,
    title: 'Everything Everywhere All at Once',
    year: 2022,
    runtime_minutes: 139,
    genres: ['Sci-Fi', 'Action', 'Comedy', 'Adventure'],
    moods: ['absurd', 'heartwarming', 'mind-bending', 'energetic', 'cathartic'],
    overview: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what is important to her by connecting with the lives she could have led in other universes.',
    poster_url: 'https://image.tmdb.org/t/p/w500/w3LxiVYPq6ABGwp9cuEj4BM9St5.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/70Rm9mwhbtkeHiE2OsOzUVu8ZGf.jpg',
    streaming_platforms: ['Netflix', 'Prime Video'],
    rating: 8.8,
    director: 'Daniel Kwan, Daniel Scheinert',
    cast_members: ['Michelle Yeoh', 'Ke Huy Quan', 'Stephanie Hsu', 'Jamie Lee Curtis'],
    quote: "In another life, I would have really liked just doing laundry and taxes with you.",
    trailer_url: 'https://www.youtube.com/watch?v=wxN1T1uxQ2g'
  },
  {
    id: 'arrival-2016',
    tmdb_id: 329865,
    title: 'Arrival',
    year: 2016,
    runtime_minutes: 116,
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    moods: ['cerebral', 'emotional', 'peaceful', 'philosophical', 'tense'],
    overview: 'Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.',
    poster_url: 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/yIZ1xendyqKvY3FGsqemmjeR0AC.jpg',
    streaming_platforms: ['Paramount+', 'Prime Video'],
    rating: 8.0,
    director: 'Denis Villeneuve',
    cast_members: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker'],
    quote: "Despite knowing the journey and where it leads, I embrace it, and I welcome every moment of it.",
    trailer_url: 'https://www.youtube.com/watch?v=tFMo3UJ4B4g'
  },
  {
    id: 'ex-machina-2014',
    tmdb_id: 264660,
    title: 'Ex Machina',
    year: 2014,
    runtime_minutes: 108,
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    moods: ['tense', 'claustrophobic', 'mind-bending', 'sleek', 'unsettling'],
    overview: 'A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid A.I.',
    poster_url: 'https://image.tmdb.org/t/p/w500/btbRB7nm9BmEuR0v9GVmGBSIzIO.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/bLq5r2iLpQ9B6vQ4g9iA8a4Hk9Q.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 7.7,
    director: 'Alex Garland',
    cast_members: ['Domhnall Gleeson', 'Alicia Vikander', 'Oscar Isaac'],
    quote: "To tear through the skin, looking for what is beneath.",
    trailer_url: 'https://www.youtube.com/watch?v=bggUmgeMCdc'
  },
  {
    id: 'coherence-2013',
    tmdb_id: 220289,
    title: 'Coherence',
    year: 2013,
    runtime_minutes: 89,
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    moods: ['mind-bending', 'tense', 'indie', 'claustrophobic', 'short'],
    overview: 'Strange things begin to happen when a group of friends gather for a dinner party on an evening when a comet is passing overhead.',
    poster_url: 'https://image.tmdb.org/t/p/w500/h6g68q1r1yY0gXb4m8n8aX2b1rO.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/9r8O7k3zXv8n6nB9r1v3a1bX.jpg',
    streaming_platforms: ['Prime Video', 'Apple TV+'],
    rating: 7.2,
    director: 'James Ward Byrkit',
    cast_members: ['Emily Baldoni', 'Maury Sterling', 'Nicholas Brendon'],
    quote: "There is another version of us out there.",
    trailer_url: 'https://www.youtube.com/watch?v=sEceDz1Rodc'
  },

  // Dark Comedy / Sharp Mystery
  {
    id: 'knives-out-2019',
    tmdb_id: 546554,
    title: 'Knives Out',
    year: 2019,
    runtime_minutes: 130,
    genres: ['Comedy', 'Mystery', 'Crime'],
    moods: ['witty', 'fun', 'clever', 'satirical', 'cozy'],
    overview: 'When renowned crime novelist Harlan Thrombey is found dead at his estate, the inquisitive Detective Benoit Blanc is mysteriously enlisted to investigate.',
    poster_url: 'https://image.tmdb.org/t/p/w500/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia99GQI.jpg',
    streaming_platforms: ['Netflix', 'Prime Video'],
    rating: 7.9,
    director: 'Rian Johnson',
    cast_members: ['Daniel Craig', 'Ana de Armas', 'Chris Evans'],
    quote: "I suspect foul play. I have eliminated no suspects.",
    trailer_url: 'https://www.youtube.com/watch?v=qGqiHJTsR4Q'
  },
  {
    id: 'parasite-2019',
    tmdb_id: 496243,
    title: 'Parasite',
    year: 2019,
    runtime_minutes: 132,
    genres: ['Comedy', 'Thriller', 'Drama'],
    moods: ['dark comedy', 'tense', 'satirical', 'sharp', 'unpredictable'],
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    poster_url: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdEvAC2USv6Ue.jpg',
    streaming_platforms: ['Max', 'Hulu'],
    rating: 8.5,
    director: 'Bong Joon-ho',
    cast_members: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    quote: "You know what kind of plan never fails? No plan at all.",
    trailer_url: 'https://www.youtube.com/watch?v=5xH0RzeSojI'
  },
  {
    id: 'the-menu-2022',
    tmdb_id: 593643,
    title: 'The Menu',
    year: 2022,
    runtime_minutes: 107,
    genres: ['Comedy', 'Horror', 'Thriller'],
    moods: ['dark comedy', 'satirical', 'witty', 'tense', 'foodie'],
    overview: 'A young couple travels to a remote island to eat at an exclusive restaurant where the chef has prepared a lavish menu, with some shocking surprises.',
    poster_url: 'https://image.tmdb.org/t/p/w500/fPtUgMcLIboqlTlPrq0bYeXT974.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/mSyQoValh9UJRJMeist7OAvbtqq.jpg',
    streaming_platforms: ['Hulu', 'Disney+'],
    rating: 7.2,
    director: 'Mark Mylod',
    cast_members: ['Ralph Fiennes', 'Anya Taylor-Joy', 'Nicholas Hoult'],
    quote: "We must be relentless in our pursuit of culinary perfection.",
    trailer_url: 'https://www.youtube.com/watch?v=C_uTkUGcHv4'
  },
  {
    id: 'palm-springs-2020',
    tmdb_id: 587792,
    title: 'Palm Springs',
    year: 2020,
    runtime_minutes: 90,
    genres: ['Comedy', 'Romance', 'Sci-Fi'],
    moods: ['fun', 'quirky', 'nihilistic', 'romantic', 'short'],
    overview: 'When carefree Nyles and reluctant maid of honor Sarah have a chance encounter at a Palm Springs wedding, things get complicated as they are unable to escape the venue, themselves, or each other.',
    poster_url: 'https://image.tmdb.org/t/p/w500/1fgjgEPnprwhRk1XmJzH3w2vY.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/qDxqGvh7m7N9u7i6g3P.jpg',
    streaming_platforms: ['Hulu', 'Prime Video'],
    rating: 7.4,
    director: 'Max Barbakow',
    cast_members: ['Andy Samberg', 'Cristin Milioti', 'J.K. Simmons'],
    quote: "Today, tomorrow, yesterday, it's all the same.",
    trailer_url: 'https://www.youtube.com/watch?v=CpBLtXdUACk'
  },
  {
    id: 'grand-budapest-hotel-2014',
    tmdb_id: 120467,
    title: 'The Grand Budapest Hotel',
    year: 2014,
    runtime_minutes: 99,
    genres: ['Comedy', 'Adventure', 'Drama'],
    moods: ['whimsical', 'aesthetic', 'charming', 'witty', 'stylish'],
    overview: 'The adventures of Gustave H, a legendary concierge at a famous European hotel from the period between the world wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.',
    poster_url: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/9Xw0I5RV2ZqNLkMcaV09z9.jpg',
    streaming_platforms: ['Disney+', 'Hulu'],
    rating: 8.1,
    director: 'Wes Anderson',
    cast_members: ['Ralph Fiennes', 'Tony Revolori', 'Saoirse Ronan', 'Willem Dafoe'],
    quote: "Rudeness is merely the expression of fear.",
    trailer_url: 'https://www.youtube.com/watch?v=1Fg5iWmQjwk'
  },
  {
    id: 'what-we-do-in-shadows-2014',
    tmdb_id: 246741,
    title: 'What We Do in the Shadows',
    year: 2014,
    runtime_minutes: 86,
    genres: ['Comedy', 'Horror'],
    moods: ['hilarious', 'mockumentary', 'vampire', 'quirky', 'short'],
    overview: 'Viago, Deacon, and Vladislav are vampires who are finding that modern life has them struggling with the mundane - like paying rent, keeping up with the chore wheel, and trying to get into nightclubs.',
    poster_url: 'https://image.tmdb.org/t/p/w500/9eUS5zEw2a7fN9Gz5GfV0BwP2h5.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/7X8mN4G9h9X8Z1v0b0y7.jpg',
    streaming_platforms: ['Prime Video', 'Apple TV+'],
    rating: 7.7,
    director: 'Taika Waititi, Jemaine Clement',
    cast_members: ['Taika Waititi', 'Jemaine Clement', 'Jonathan Brugh'],
    quote: "We're vampires, we don't put down towels.",
    trailer_url: 'https://www.youtube.com/watch?v=IAZEWtyhpes'
  },

  // Thriller / Crime / Dark Noir
  {
    id: 'se7en-1995',
    tmdb_id: 807,
    title: 'Se7en',
    year: 1995,
    runtime_minutes: 127,
    genres: ['Crime', 'Mystery', 'Thriller'],
    moods: ['dark', 'gritty', 'tense', 'disturbing', 'atmospheric'],
    overview: 'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives in a perpetually raining metropolis.',
    poster_url: 'https://image.tmdb.org/t/p/w500/6yoghtyTBoPUDZ1yv2mG9qNfQf5.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/kGzFbGhp99zVa6vdZjWgn7J050S.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 8.6,
    director: 'David Fincher',
    cast_members: ['Brad Pitt', 'Morgan Freeman', 'Gwyneth Paltrow', 'Kevin Spacey'],
    quote: "What's in the box?!",
    trailer_url: 'https://www.youtube.com/watch?v=znmZoVkCjpI'
  },
  {
    id: 'zodiac-2007',
    tmdb_id: 1949,
    title: 'Zodiac',
    year: 2007,
    runtime_minutes: 157,
    genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    moods: ['obsessive', 'atmospheric', 'slow-burn', 'procedural', 'chilling'],
    overview: 'Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer, an unidentified murderer who terrorizes Northern California.',
    poster_url: 'https://image.tmdb.org/t/p/w500/6Y0hC4q30V7sX12mIqX2.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/uPv7i2k1j7K8t7B1v2q0.jpg',
    streaming_platforms: ['Paramount+', 'Prime Video'],
    rating: 7.7,
    director: 'David Fincher',
    cast_members: ['Jake Gyllenhaal', 'Mark Ruffalo', 'Robert Downey Jr.'],
    quote: "I need to know who he is. I need to stand there, I need to look him in the eye.",
    trailer_url: 'https://www.youtube.com/watch?v=yNncHPl1UXg'
  },
  {
    id: 'gone-girl-2014',
    tmdb_id: 210577,
    title: 'Gone Girl',
    year: 2014,
    runtime_minutes: 149,
    genres: ['Drama', 'Mystery', 'Thriller'],
    moods: ['twisted', 'tense', 'cynical', 'gripping', 'psychological'],
    overview: 'With his wife\'s disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him when it\'s suspected that he may not be innocent.',
    poster_url: 'https://image.tmdb.org/t/p/w500/qymaJhucewUwjpbt3n04iV8mN2v.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/71R37Nn66X1v.jpg',
    streaming_platforms: ['Max', 'Hulu'],
    rating: 8.1,
    director: 'David Fincher',
    cast_members: ['Ben Affleck', 'Rosamund Pike', 'Neil Patrick Harris'],
    quote: "We were the Cool Girl. Men always say that as the defining compliment, don't they?",
    trailer_url: 'https://www.youtube.com/watch?v=2-_-1nJf8Vg'
  },
  {
    id: 'nightcrawler-2014',
    tmdb_id: 242582,
    title: 'Nightcrawler',
    year: 2014,
    runtime_minutes: 117,
    genres: ['Crime', 'Drama', 'Thriller'],
    moods: ['grimy', 'unsettling', 'neon', 'cynical', 'intense'],
    overview: 'When Lou Bloom, a driven man desperate for work, discovers the high-speed world of L.A. crime journalism, he blurs the line between observer and participant to become the star of his own story.',
    poster_url: 'https://image.tmdb.org/t/p/w500/8A7qMhQj9aI6b7.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/8hL6l9M.jpg',
    streaming_platforms: ['Netflix', 'Prime Video'],
    rating: 7.9,
    director: 'Dan Gilroy',
    cast_members: ['Jake Gyllenhaal', 'Rene Russo', 'Riz Ahmed'],
    quote: "If you want to win the lottery, you have to make the money to buy a ticket.",
    trailer_url: 'https://www.youtube.com/watch?v=u1uP_8vJr4s'
  },
  {
    id: 'prisoners-2013',
    tmdb_id: 146233,
    title: 'Prisoners',
    year: 2013,
    runtime_minutes: 153,
    genres: ['Drama', 'Mystery', 'Thriller', 'Crime'],
    moods: ['tense', 'bleak', 'gripping', 'raw', 'moral dilemma'],
    overview: 'When Keller Dover\'s daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts.',
    poster_url: 'https://image.tmdb.org/t/p/w500/uhvi2knTTuh5vlx5j.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/u1j2i3.jpg',
    streaming_platforms: ['Netflix', 'Prime Video'],
    rating: 8.1,
    director: 'Denis Villeneuve',
    cast_members: ['Hugh Jackman', 'Jake Gyllenhaal', 'Viola Davis', 'Paul Dano'],
    quote: "Pray for the best, prepare for the worst.",
    trailer_url: 'https://www.youtube.com/watch?v=bpXfcTF6iVk'
  },
  {
    id: 'drive-2011',
    tmdb_id: 64690,
    title: 'Drive',
    year: 2011,
    runtime_minutes: 100,
    genres: ['Action', 'Crime', 'Drama'],
    moods: ['stylish', 'synthwave', 'atmospheric', 'violent', 'cool'],
    overview: 'A mysterious Hollywood action film stuntman gets in trouble with gangsters when he tries to help his neighbor\'s husband rob a pawn shop while serving as his getaway driver.',
    poster_url: 'https://image.tmdb.org/t/p/w500/602vev0.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/k1m9.jpg',
    streaming_platforms: ['Apple TV+', 'Prime Video'],
    rating: 7.8,
    director: 'Nicolas Winding Refn',
    cast_members: ['Ryan Gosling', 'Carey Mulligan', 'Bryan Cranston', 'Albert Brooks'],
    quote: "I give you a five-minute window. Anything happens in that five minutes and I'm yours.",
    trailer_url: 'https://www.youtube.com/watch?v=KBiOF3y1W0Y'
  },

  // Feel-Good / Wholesome / Romantic
  {
    id: 'spirited-away-2001',
    tmdb_id: 129,
    title: 'Spirited Away',
    year: 2001,
    runtime_minutes: 125,
    genres: ['Animation', 'Family', 'Fantasy'],
    moods: ['magical', 'wholesome', 'nostalgic', 'peaceful', 'visual feast'],
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    poster_url: 'https://image.tmdb.org/t/p/w500/393rIHkrqbsnRz4jLzU43gB.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/mSDsSDwaP3E7d.jpg',
    streaming_platforms: ['Max', 'Netflix'],
    rating: 8.6,
    director: 'Hayao Miyazaki',
    cast_members: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
    quote: "Once you've met someone you never really forget them. It just takes a while for your memories to return.",
    trailer_url: 'https://www.youtube.com/watch?v=ByXuk9QqQkk'
  },
  {
    id: 'la-la-land-2016',
    tmdb_id: 313369,
    title: 'La La Land',
    year: 2016,
    runtime_minutes: 128,
    genres: ['Comedy', 'Drama', 'Romance', 'Music'],
    moods: ['romantic', 'bittersweet', 'vibrant', 'dazzling', 'dreamy'],
    overview: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    poster_url: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkVJ0.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/qJeU7N.jpg',
    streaming_platforms: ['Netflix', 'Hulu'],
    rating: 8.0,
    director: 'Damien Chazelle',
    cast_members: ['Ryan Gosling', 'Emma Stone', 'John Legend'],
    quote: "Here's to the ones who dream, foolish as they may seem.",
    trailer_url: 'https://www.youtube.com/watch?v=0pdqf4P9MB8'
  },
  {
    id: 'past-lives-2023',
    tmdb_id: 666277,
    title: 'Past Lives',
    year: 2023,
    runtime_minutes: 106,
    genres: ['Drama', 'Romance'],
    moods: ['tender', 'poignant', 'gentle', 'melancholic', 'profound'],
    overview: 'Nora and Hae Sung, two deeply connected childhood friends, are wrested apart after Nora\'s family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week.',
    poster_url: 'https://image.tmdb.org/t/p/w500/k3waqVXSnv6cvGA.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/m9A02a.jpg',
    streaming_platforms: ['Paramount+', 'Apple TV+'],
    rating: 7.9,
    director: 'Celine Song',
    cast_members: ['Greta Lee', 'Teo Yoo', 'John Magaro'],
    quote: "If two people get married, they say it's because their In-Yun has lasted through 8,000 layers of lives.",
    trailer_url: 'https://www.youtube.com/watch?v=kA244xewjcI'
  },
  {
    id: 'paddington-2-2017',
    tmdb_id: 346648,
    title: 'Paddington 2',
    year: 2017,
    runtime_minutes: 103,
    genres: ['Family', 'Comedy', 'Adventure'],
    moods: ['pure joy', 'wholesome', 'delightful', 'comfort', 'funny'],
    overview: 'Paddington, now happily settled with the Brown family and a popular member of the local community, picks up a series of odd jobs to buy the perfect present for his Aunt Lucy\'s 100th birthday.',
    poster_url: 'https://image.tmdb.org/t/p/w500/aBw8z.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/bO1o.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 7.8,
    director: 'Paul King',
    cast_members: ['Ben Whishaw', 'Hugh Grant', 'Sally Hawkins', 'Hugh Bonneville'],
    quote: "If we're kind and polite, the world will be right.",
    trailer_url: 'https://www.youtube.com/watch?v=52x5HJ9H8DM'
  },
  {
    id: 'about-time-2013',
    tmdb_id: 122906,
    title: 'About Time',
    year: 2013,
    runtime_minutes: 123,
    genres: ['Drama', 'Romance', 'Fantasy'],
    moods: ['heartwarming', 'tearjerker', 'cozy', 'uplifting', 'romantic'],
    overview: 'At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life. His decision to make his world a better place by getting a girlfriend turns out not to be so simple.',
    poster_url: 'https://image.tmdb.org/t/p/w500/iR1b.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/w0J9.jpg',
    streaming_platforms: ['Netflix', 'Prime Video'],
    rating: 7.8,
    director: 'Richard Curtis',
    cast_members: ['Domhnall Gleeson', 'Rachel McAdams', 'Bill Nighy'],
    quote: "We're all traveling through time together, every day of our lives. All we can do is do our best to relish this remarkable ride.",
    trailer_url: 'https://www.youtube.com/watch?v=T7A810duHvw'
  },
  {
    id: 'amelie-2001',
    tmdb_id: 194,
    title: 'Amélie',
    year: 2001,
    runtime_minutes: 122,
    genres: ['Comedy', 'Romance'],
    moods: ['whimsical', 'charming', 'visual delight', 'uplifting', 'sweet'],
    overview: 'Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.',
    poster_url: 'https://image.tmdb.org/t/p/w500/b0y0.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/l6w7.jpg',
    streaming_platforms: ['Prime Video', 'Apple TV+'],
    rating: 8.3,
    director: 'Jean-Pierre Jeunet',
    cast_members: ['Audrey Tautou', 'Mathieu Kassovitz', 'Rufus'],
    quote: "Times are hard for dreamers.",
    trailer_url: 'https://www.youtube.com/watch?v=HUECWi5pX7o'
  },

  // Adrenaline / High-Octane Action
  {
    id: 'mad-max-fury-road-2015',
    tmdb_id: 76341,
    title: 'Mad Max: Fury Road',
    year: 2015,
    runtime_minutes: 120,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    moods: ['adrenaline', 'relentless', 'visceral', 'epic', 'wild'],
    overview: 'An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and almost everyone is crazed fighting for the necessities of life.',
    poster_url: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/nlCHUW2Y9X0C.jpg',
    streaming_platforms: ['Max', 'Hulu'],
    rating: 8.1,
    director: 'George Miller',
    cast_members: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult'],
    quote: "Witness me!",
    trailer_url: 'https://www.youtube.com/watch?v=hEJnMQG9ev8'
  },
  {
    id: 'top-gun-maverick-2022',
    tmdb_id: 361743,
    title: 'Top Gun: Maverick',
    year: 2022,
    runtime_minutes: 130,
    genres: ['Action', 'Drama'],
    moods: ['thrilling', 'crowd-pleaser', 'nostalgic', 'aerial', 'feel-good'],
    overview: 'After more than thirty years of service as one of the Navy’s top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot and dodging the advancement in rank that would ground him.',
    poster_url: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/AaV1YIdWKnjAOiVA.jpg',
    streaming_platforms: ['Paramount+', 'Prime Video'],
    rating: 8.3,
    director: 'Joseph Kosinski',
    cast_members: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
    quote: "It's not the plane, it's the pilot.",
    trailer_url: 'https://www.youtube.com/watch?v=giXco2jaZ_4'
  },
  {
    id: 'spider-verse-across-2023',
    tmdb_id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    runtime_minutes: 140,
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    moods: ['mind-blowing', 'visually stunning', 'energetic', 'emotional', 'fast-paced'],
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.',
    poster_url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    streaming_platforms: ['Netflix'],
    rating: 8.7,
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    cast_members: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    quote: "Everyone keeps telling me how my story is supposed to go. Nah. Imma do my own thing.",
    trailer_url: 'https://www.youtube.com/watch?v=cqGjhVJWtEg'
  },
  {
    id: 'the-dark-knight-2008',
    tmdb_id: 155,
    title: 'The Dark Knight',
    year: 2008,
    runtime_minutes: 152,
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    moods: ['intense', 'gritty', 'iconic', 'masterpiece', 'dark'],
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 9.0,
    director: 'Christopher Nolan',
    cast_members: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Gary Oldman'],
    quote: "Why so serious?",
    trailer_url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY'
  },
  {
    id: 'john-wick-4-2023',
    tmdb_id: 603692,
    title: 'John Wick: Chapter 4',
    year: 2023,
    runtime_minutes: 169,
    genres: ['Action', 'Thriller', 'Crime'],
    moods: ['adrenaline', 'stylish', 'choreography', 'relentless', 'epic'],
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.',
    poster_url: 'https://image.tmdb.org/t/p/w500/vZloFAK7NKnMGKEHvYcnEtENIO.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/7I6VUdPj6tQwhd1.jpg',
    streaming_platforms: ['Prime Video', 'Apple TV+'],
    rating: 7.7,
    director: 'Chad Stahelski',
    cast_members: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgård', 'Hiroyuki Sanada'],
    quote: "How you do anything is how you do everything.",
    trailer_url: 'https://www.youtube.com/watch?v=qEVUtrk8_B4'
  },

  // Emotional / Drama / Indie Accolades
  {
    id: 'whiplash-2014',
    tmdb_id: 244786,
    title: 'Whiplash',
    year: 2014,
    runtime_minutes: 107,
    genres: ['Drama', 'Music'],
    moods: ['intense', 'obsessive', 'adrenaline', 'perfectionism', 'electrifying'],
    overview: 'Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, pushing his physical and mental limits to the brink.',
    poster_url: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/6bbZ6X7e1eO13vj2Pec3m8hQ9bX.jpg',
    streaming_platforms: ['Netflix', 'Apple TV+'],
    rating: 8.5,
    director: 'Damien Chazelle',
    cast_members: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser'],
    quote: "There are no two words in the English language more harmful than 'good job'.",
    trailer_url: 'https://www.youtube.com/watch?v=7d_jQycdQGo'
  },
  {
    id: 'the-holdovers-2023',
    tmdb_id: 840430,
    title: 'The Holdovers',
    year: 2023,
    runtime_minutes: 133,
    genres: ['Comedy', 'Drama'],
    moods: ['warm', 'cozy', 'melancholic', 'heartfelt', 'holiday'],
    overview: 'A cranky history teacher at a remote prep school is forced to remain on campus over the holidays with a grieving cook and a troubled student who has nowhere to go.',
    poster_url: 'https://image.tmdb.org/t/p/w500/VHSzN0mJ2z.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/f1AQ.jpg',
    streaming_platforms: ['Prime Video', 'Apple TV+'],
    rating: 8.0,
    director: 'Alexander Payne',
    cast_members: ['Paul Giamatti', 'Da\'Vine Joy Randolph', 'Dominic Sessa'],
    quote: "The world does not make sense to anyone, Paul. But we have to learn to live in it anyway.",
    trailer_url: 'https://www.youtube.com/watch?v=AhKLkQvBfBg'
  },
  {
    id: 'aftersun-2022',
    tmdb_id: 965150,
    title: 'Aftersun',
    year: 2022,
    runtime_minutes: 102,
    genres: ['Drama'],
    moods: ['poignant', 'bittersweet', 'nostalgic', 'intimate', 'shattering'],
    overview: 'Sophie reflects on the shared joy and private melancholy of a holiday she took with her loving and troubled father twenty years earlier. Memories real and imagined fill the gaps.',
    poster_url: 'https://image.tmdb.org/t/p/w500/5k7m.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/u20w.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 7.7,
    director: 'Charlotte Wells',
    cast_members: ['Paul Mescal', 'Frankie Corio', 'Celia Rowlson-Hall'],
    quote: "You can live wherever you want to live. Be whoever you want to be.",
    trailer_url: 'https://www.youtube.com/watch?v=vXkcfY7v88Q'
  },
  {
    id: 'the-banshees-of-inisherin-2022',
    tmdb_id: 674324,
    title: 'The Banshees of Inisherin',
    year: 2022,
    runtime_minutes: 114,
    genres: ['Drama', 'Comedy'],
    moods: ['dark comedy', 'bleak', 'tragicomic', 'absurd', 'atmospheric'],
    overview: 'Two lifelong friends find themselves at an impasse when one abruptly ends their relationship, with alarming consequences for both on a remote Irish island.',
    poster_url: 'https://image.tmdb.org/t/p/w500/4yFGnm.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/o82x.jpg',
    streaming_platforms: ['Hulu', 'Disney+'],
    rating: 7.7,
    director: 'Martin McDonagh',
    cast_members: ['Colin Farrell', 'Brendan Gleeson', 'Kerry Condon', 'Barry Keoghan'],
    quote: "I just don't like you no more.",
    trailer_url: 'https://www.youtube.com/watch?v=uCVw7ceC_o4'
  },

  // Atmospheric Horror & Creepy Thrills
  {
    id: 'get-out-2017',
    tmdb_id: 419430,
    title: 'Get Out',
    year: 2017,
    runtime_minutes: 104,
    genres: ['Horror', 'Mystery', 'Thriller'],
    moods: ['tense', 'unsettling', 'satirical', 'gripping', 'psychological'],
    overview: 'Chris and his girlfriend Rose have reached the meet-the-parents milestone of dating, she invites him for a weekend getaway upstate with her parents. At first, Chris reads the family\'s overly accommodating behavior as nervous attempts to deal with their daughter\'s interracial relationship, but as the weekend progresses, a series of increasingly disturbing discoveries lead him to a truth that he could have never imagined.',
    poster_url: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/tP6w.jpg',
    streaming_platforms: ['Prime Video', 'Apple TV+'],
    rating: 7.8,
    director: 'Jordan Peele',
    cast_members: ['Daniel Kaluuya', 'Allison Williams', 'Bradley Whitford', 'Catherine Keener'],
    quote: "Now, sink into the floor.",
    trailer_url: 'https://www.youtube.com/watch?v=DzfpyUB60YY'
  },
  {
    id: 'hereditary-2018',
    tmdb_id: 493922,
    title: 'Hereditary',
    year: 2018,
    runtime_minutes: 127,
    genres: ['Horror', 'Mystery', 'Drama'],
    moods: ['terrifying', 'dread', 'bleak', 'disturbing', 'shocking'],
    overview: 'When the matriarch of the Graham family passes away, her daughter\'s family begins to unravel cryptic and increasingly terrifying secrets about their ancestry.',
    poster_url: 'https://image.tmdb.org/t/p/w500/p9fom.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/y0pL.jpg',
    streaming_platforms: ['Max', 'Apple TV+'],
    rating: 7.3,
    director: 'Ari Aster',
    cast_members: ['Toni Collette', 'Alex Wolff', 'Milly Shapiro', 'Gabriel Byrne'],
    quote: "I am your mother! You understand?!",
    trailer_url: 'https://www.youtube.com/watch?v=V6wWKNij_1M'
  },
  {
    id: 'talk-to-me-2023',
    tmdb_id: 1008042,
    title: 'Talk to Me',
    year: 2023,
    runtime_minutes: 95,
    genres: ['Horror', 'Thriller'],
    moods: ['intense', 'gritty', 'supernatural', 'fast-paced', 'chilling', 'short'],
    overview: 'When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill, until one of them goes too far and opens the door to the other side.',
    poster_url: 'https://image.tmdb.org/t/p/w500/kdP1i7w.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/original/9n2t.jpg',
    streaming_platforms: ['Netflix', 'Paramount+'],
    rating: 7.2,
    director: 'Danny Philippou, Michael Philippou',
    cast_members: ['Sophie Wilde', 'Alexandra Jensen', 'Joe Bird'],
    quote: "Talk to me. I let you in.",
    trailer_url: 'https://www.youtube.com/watch?v=aLAKJu9aJys'
  }
];

export const moodPresetsList: MoodPresetSeed[] = [
  {
    id: 'late-night-noir',
    label: 'Late Night Noir',
    emoji: '🌃',
    tagline: 'Neon rain, sharp shadows & moral decay',
    description: 'Moody, stylish thrillers and neo-noirs designed for midnight watching when the world is quiet.',
    seed_filters: {
      mood_tags: ['neon', 'atmospheric', 'gritty', 'slow-burn'],
      genre_tags: ['Thriller', 'Crime', 'Mystery']
    },
    sample_movie_ids: ['blade-runner-2049-2017', 'se7en-1995', 'nightcrawler-2014', 'drive-2011']
  },
  {
    id: 'mind-bending-scifi',
    label: 'Mind-Bending Realities',
    emoji: '🌀',
    tagline: 'Time loops, existential dread & multiverse twists',
    description: 'Intricate, cerebral sci-fi that challenges perception and stays in your head for days.',
    seed_filters: {
      mood_tags: ['mind-bending', 'cerebral', 'philosophical'],
      genre_tags: ['Sci-Fi', 'Mystery']
    },
    sample_movie_ids: ['interstellar-2014', 'inception-2010', 'arrival-2016', 'coherence-2013']
  },
  {
    id: 'cozy-comfort',
    label: 'Cozy Sunday Wholesome',
    emoji: '☕',
    tagline: 'Warm blankets, gentle laughs & tender hearts',
    description: 'Uplifting, comforting cinema that restores faith in humanity with charm and wit.',
    seed_filters: {
      mood_tags: ['wholesome', 'warm', 'comfort', 'uplifting'],
      genre_tags: ['Comedy', 'Family', 'Drama']
    },
    sample_movie_ids: ['paddington-2-2017', 'spirited-away-2001', 'about-time-2013', 'the-holdovers-2023']
  },
  {
    id: 'pure-adrenaline',
    label: 'High-Octane Adrenaline',
    emoji: '🔥',
    tagline: 'Breakneck pacing, jaw-dropping stunts & kinetic energy',
    description: 'Masterclass action movies where every frame is packed with momentum, rhythm, and tension.',
    seed_filters: {
      mood_tags: ['adrenaline', 'relentless', 'visceral', 'fast-paced'],
      genre_tags: ['Action', 'Thriller']
    },
    sample_movie_ids: ['mad-max-fury-road-2015', 'top-gun-maverick-2022', 'john-wick-4-2023', 'whiplash-2014']
  },
  {
    id: 'sharp-wit-dark-comedy',
    label: 'Sharp Wit & Dark Satire',
    emoji: '🍸',
    tagline: 'Razor-sharp dialogue, twisted humor & delicious chaos',
    description: 'Films that make you laugh, cringe, and think with subversive wit and unpredictable plots.',
    seed_filters: {
      mood_tags: ['dark comedy', 'witty', 'satirical', 'sharp'],
      genre_tags: ['Comedy', 'Thriller', 'Crime']
    },
    sample_movie_ids: ['knives-out-2019', 'parasite-2019', 'the-menu-2022', 'grand-budapest-hotel-2014']
  },
  {
    id: 'atmospheric-dread',
    label: 'Atmospheric Dread',
    emoji: '🕯️',
    tagline: 'Lingering chills, psychological tension & creepy mysteries',
    description: 'Slow-burning horror and psychological mysteries that creep under your skin without cheap jump scares.',
    seed_filters: {
      mood_tags: ['tense', 'dread', 'unsettling', 'psychological'],
      genre_tags: ['Horror', 'Mystery', 'Thriller']
    },
    sample_movie_ids: ['get-out-2017', 'hereditary-2018', 'talk-to-me-2023', 'ex-machina-2014']
  }
];

export function seedDatabase() {
  const insertMovie = db.prepare(`
    INSERT INTO movies (
      id, tmdb_id, title, year, runtime_minutes, genres, moods, overview,
      poster_url, backdrop_url, streaming_platforms, rating, director,
      cast_members, quote, trailer_url
    ) VALUES (
      @id, @tmdb_id, @title, @year, @runtime_minutes, @genres, @moods, @overview,
      @poster_url, @backdrop_url, @streaming_platforms, @rating, @director,
      @cast_members, @quote, @trailer_url
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      year = excluded.year,
      runtime_minutes = excluded.runtime_minutes,
      genres = excluded.genres,
      moods = excluded.moods,
      overview = excluded.overview,
      poster_url = excluded.poster_url,
      backdrop_url = excluded.backdrop_url,
      streaming_platforms = excluded.streaming_platforms,
      rating = excluded.rating,
      director = excluded.director,
      cast_members = excluded.cast_members,
      quote = excluded.quote,
      trailer_url = excluded.trailer_url
  `);

  const insertMoodPreset = db.prepare(`
    INSERT INTO mood_presets (
      id, label, emoji, tagline, description, seed_filters, sample_movie_ids
    ) VALUES (
      @id, @label, @emoji, @tagline, @description, @seed_filters, @sample_movie_ids
    )
    ON CONFLICT(id) DO UPDATE SET
      label = excluded.label,
      emoji = excluded.emoji,
      tagline = excluded.tagline,
      description = excluded.description,
      seed_filters = excluded.seed_filters,
      sample_movie_ids = excluded.sample_movie_ids
  `);

  const transaction = db.transaction(() => {
    for (const m of moviesList) {
      insertMovie.run({
        ...m,
        genres: JSON.stringify(m.genres),
        moods: JSON.stringify(m.moods),
        streaming_platforms: JSON.stringify(m.streaming_platforms),
        cast_members: JSON.stringify(m.cast_members)
      });
    }

    for (const p of moodPresetsList) {
      insertMoodPreset.run({
        ...p,
        seed_filters: JSON.stringify(p.seed_filters),
        sample_movie_ids: JSON.stringify(p.sample_movie_ids)
      });
    }
  });

  transaction();
  console.log(`Successfully seeded ${moviesList.length} movies and ${moodPresetsList.length} mood presets.`);
}

// If run directly via CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedDatabase();
}
