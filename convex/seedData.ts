import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingMovies = await ctx.db.query("movies").take(1);
    if (existingMovies.length > 0) {
      return "Database already seeded";
    }

    // Sample movies
    const movies = [
      {
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        genre: ["Drama", "Crime"],
        releaseYear: 1994,
        rating: 9.3,
        type: "movie" as const,
        director: "Frank Darabont",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
        duration: 142,
      },
      {
        title: "The Godfather",
        description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        genre: ["Crime", "Drama"],
        releaseYear: 1972,
        rating: 9.2,
        type: "movie" as const,
        director: "Francis Ford Coppola",
        cast: ["Marlon Brando", "Al Pacino", "James Caan"],
        duration: 175,
      },
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        genre: ["Action", "Crime", "Drama"],
        releaseYear: 2008,
        rating: 9.0,
        type: "movie" as const,
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        duration: 152,
      },
      {
        title: "Pulp Fiction",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        genre: ["Crime", "Drama"],
        releaseYear: 1994,
        rating: 8.9,
        type: "movie" as const,
        director: "Quentin Tarantino",
        cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
        duration: 154,
      },
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genre: ["Action", "Sci-Fi", "Thriller"],
        releaseYear: 2010,
        rating: 8.8,
        type: "movie" as const,
        director: "Christopher Nolan",
        cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
        duration: 148,
      },
      {
        title: "Forrest Gump",
        description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.",
        genre: ["Drama", "Romance"],
        releaseYear: 1994,
        rating: 8.8,
        type: "movie" as const,
        director: "Robert Zemeckis",
        cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
        duration: 142,
      },
    ];

    // Sample TV shows
    const tvShows = [
      {
        title: "Breaking Bad",
        description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        genre: ["Crime", "Drama", "Thriller"],
        releaseYear: 2008,
        rating: 9.5,
        type: "tv" as const,
        creator: "Vince Gilligan",
        cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
        seasons: 5,
        status: "completed" as const,
      },
      {
        title: "Game of Thrones",
        description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        genre: ["Action", "Adventure", "Drama"],
        releaseYear: 2011,
        rating: 9.3,
        type: "tv" as const,
        creator: "David Benioff",
        cast: ["Emilia Clarke", "Peter Dinklage", "Kit Harington"],
        seasons: 8,
        status: "completed" as const,
      },
      {
        title: "The Sopranos",
        description: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life.",
        genre: ["Crime", "Drama"],
        releaseYear: 1999,
        rating: 9.2,
        type: "tv" as const,
        creator: "David Chase",
        cast: ["James Gandolfini", "Lorraine Bracco", "Edie Falco"],
        seasons: 6,
        status: "completed" as const,
      },
      {
        title: "The Wire",
        description: "The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.",
        genre: ["Crime", "Drama", "Thriller"],
        releaseYear: 2002,
        rating: 9.3,
        type: "tv" as const,
        creator: "David Simon",
        cast: ["Dominic West", "Lance Reddick", "Sonja Sohn"],
        seasons: 5,
        status: "completed" as const,
      },
      {
        title: "Stranger Things",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
        genre: ["Drama", "Fantasy", "Horror"],
        releaseYear: 2016,
        rating: 8.7,
        type: "tv" as const,
        creator: "The Duffer Brothers",
        cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
        seasons: 4,
        status: "ongoing" as const,
      },
      {
        title: "The Office",
        description: "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
        genre: ["Comedy"],
        releaseYear: 2005,
        rating: 8.9,
        type: "tv" as const,
        creator: "Greg Daniels",
        cast: ["Steve Carell", "John Krasinski", "Jenna Fischer"],
        seasons: 9,
        status: "completed" as const,
      },
    ];

    // Insert movies
    for (const movie of movies) {
      await ctx.db.insert("movies", movie);
    }

    // Insert TV shows
    for (const tvShow of tvShows) {
      await ctx.db.insert("tvShows", tvShow);
    }

    return "Database seeded successfully";
  },
});
