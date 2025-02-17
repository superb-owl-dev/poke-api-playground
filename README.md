# Pokédex React Application

A modern, responsive Pokédex web application built with React, TypeScript, and Vite. This application demonstrates integration with the PokéAPI (v2) to showcase Pokémon data with various viewing and filtering options.

## Features

- **Multiple View Options**: Toggle between grid and list views (persisted across sessions)
- **Generation Filtering**: Filter Pokémon by their generation with paginated results
- **Detailed Pokémon Information**:
  - National Pokédex number
  - Official artwork
  - Type information
  - Generation information
  - Base stats with visual representation
  - Physical characteristics (height, weight)
  - Special categories (Legendary, Mythical, Baby)
  - Capture rate percentage

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query
- **Routing**: React Router
- **HTTP Client**: Axios
- **API**: PokéAPI v2

## API Integration Details

This application utilizes several PokéAPI endpoints to provide comprehensive Pokémon data:

### Core Endpoints Used

1. **Pokémon List** (`/pokemon`)
   - Paginated list of all Pokémon
   - Parameters: limit, offset
   - Used for the main listing view

2. **Pokémon Details** (`/pokemon/{id or name}`)
   - Detailed information about specific Pokémon
   - Includes sprites, stats, types, and basic info

3. **Pokémon Species** (`/pokemon-species/{id or name}`)
   - Additional species-specific information
   - Used for capture rates, categories (Legendary/Mythical status)
   - Handles variant forms through the varieties field

4. **Generations** (`/generation`)
   - List of all Pokémon generations
   - Used for generation filtering
   - Includes region and Pokémon species information

### API Integration Challenges & Solutions

1. **Form Handling**
   - Challenge: Some Pokémon have multiple forms with different endpoints
   - Solution: Always fetch species data first, then use the default variety to get the correct form

2. **Data Relationships**
   - Challenge: Connecting Pokémon to their generations and species data
   - Solution: Parallel data fetching with React Query and data merging

3. **Pagination**
   - Challenge: Different pagination needs for full list vs generation filtering
   - Solution: Custom pagination logic for generation-filtered results

## Suggested SDK Improvements

The current implementation could benefit from several SDK-level improvements:

1. **Type Safety**
   - Pre-generated TypeScript types for all API responses
   - Runtime type validation
   - Strict typing for parameters

2. **Resource Relationships**
   - Automated resolution of related resources
   - Built-in support for expanding relationships (e.g., automatically including species data with Pokémon)
   - Normalized data caching

3. **Error Handling**
   - Specific error types for different API errors
   - Retry logic with backoff
   - Rate limiting protection

4. **Caching & Performance**
   - Smart caching layer with TTL support
   - Batch request optimization
   - Automatic request deduplication

5. **Developer Experience**
   - Builder pattern for complex queries
   - Fluent API for filtering and pagination
   - Built-in pagination helpers
   - Resource-specific method signatures

Example of ideal SDK usage:

```typescript
const sdk = new PokeAPI();

// Current implementation
const pokemon = await api.getPokemon(id);
const species = await api.getSpecies(id);

// Ideal SDK implementation
const pokemon = await sdk.pokemon(id)
  .include(['species', 'forms'])
  .withGeneration()
  .fetch();

// or builder pattern
const query = sdk.pokemon
  .where({ generation: 1 })
  .orderBy('id')
  .paginate(20)
  .include(['species']);

const results = await query.fetch();
```

6. **Real-time Updates**
   - WebSocket support for real-time data
   - Event system for data updates

7. **Data Transformation**
   - Built-in utilities for common transformations
   - Customizable response shapes
   - Computed properties

These improvements would significantly reduce boilerplate code, improve type safety, and provide a more intuitive developer experience.

## Setup & Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
