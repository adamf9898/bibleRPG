import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserProfile from "./components/UserProfile";
import { Player, createDefaultPlayer } from "./game/player";

const App: React.FC = () => {
    // Create a sample player for demonstration
    const [player] = useState<Player>(() => {
        const samplePlayer = createDefaultPlayer("Faithful Pilgrim");
        // Add some sample data for demonstration
        samplePlayer.stats.level = 5;
        samplePlayer.stats.experience = 1250;
        samplePlayer.stats.health = 150;
        samplePlayer.stats.mana = 80;
        samplePlayer.stats.strength = 15;
        samplePlayer.stats.agility = 12;
        samplePlayer.stats.intelligence = 14;
        samplePlayer.gold = 350;
        samplePlayer.inventory = [
            { id: '1', name: 'Scroll of Wisdom', quantity: 3 },
            { id: '2', name: 'Holy Water', quantity: 5 },
            { id: '3', name: 'Bread of Life', quantity: 2 },
        ];
        return samplePlayer;
    });

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            <h1 style={{ color: '#2c3e50' }}>Welcome to Bible RPG</h1>
                            <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>
                                Start your adventure and share The Gospel!
                            </p>
                            <div style={{ marginTop: '2rem' }}>
                                <Link
                                    to="/profile"
                                    style={{
                                        display: 'inline-block',
                                        padding: '1rem 2rem',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '4px',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    }
                />
                <Route
                    path="/profile"
                    element={<UserProfile player={player} />}
                />
            </Routes>
        </Router>
    );
};

export default App;