import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '../game/player';

interface UserProfileProps {
    player: Player;
}

const UserProfile: React.FC<UserProfileProps> = ({ player }) => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '2rem',
                borderRadius: '8px 8px 0 0',
                marginBottom: '0'
            }}>
                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                    {player.name}'s Profile
                </h1>
                <p style={{ margin: '0', opacity: '0.9' }}>
                    Level {player.stats.level} Disciple
                </p>
            </div>

            {/* Stats Section */}
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <h2 style={{ marginTop: '0', color: '#2c3e50', fontSize: '1.5rem' }}>
                    Character Stats
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <StatCard label="Health" value={player.stats.health} color="#e74c3c" />
                    <StatCard label="Mana" value={player.stats.mana} color="#3498db" />
                    <StatCard label="Strength" value={player.stats.strength} color="#e67e22" />
                    <StatCard label="Agility" value={player.stats.agility} color="#2ecc71" />
                    <StatCard label="Intelligence" value={player.stats.intelligence} color="#9b59b6" />
                    <StatCard label="Experience" value={player.stats.experience} color="#f39c12" />
                </div>
            </div>

            {/* Gold Section */}
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <h2 style={{ marginTop: '0', color: '#2c3e50', fontSize: '1.5rem' }}>
                    Wealth
                </h2>
                <div style={{
                    fontSize: '1.5rem',
                    color: '#f39c12',
                    fontWeight: 'bold'
                }}>
                    💰 {player.gold} Gold
                </div>
            </div>

            {/* Inventory Section */}
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0 0 8px 8px'
            }}>
                <h2 style={{ marginTop: '0', color: '#2c3e50', fontSize: '1.5rem' }}>
                    Inventory
                </h2>
                {player.inventory.length === 0 ? (
                    <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                        No items in inventory
                    </p>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '1rem'
                    }}>
                        {player.inventory.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: '#ecf0f1',
                                    borderRadius: '4px',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {item.name}
                                </div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                    Qty: {item.quantity}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Link
                    to="/"
                    style={{
                        display: 'inline-block',
                        padding: '0.75rem 2rem',
                        backgroundColor: '#2c3e50',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    Back to Game
                </Link>
            </div>
        </div>
    );
};

// Helper component for stat cards
const StatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
    return (
        <div style={{
            padding: '1rem',
            backgroundColor: '#ecf0f1',
            borderRadius: '4px',
            borderLeft: `4px solid ${color}`
        }}>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                {label}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                {value}
            </div>
        </div>
    );
};

export default UserProfile;
