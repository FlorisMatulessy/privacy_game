import { useState, useEffect } from "react";

const COLOR_PALETTE = [
  { name: 'Red', value: '#FF5733' },
  { name: 'Blue', value: '#3366FF' },
  { name: 'Green', value: '#10b981' },
  { name: 'Cyan', value: '#33C3FF' },
  { name: 'Yellow', value: '#FFC300' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#FF8C00' },
  { name: 'Teal', value: '#20B2AA' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Lime', value: '#84CC16' },
];

export default function DepartmentManagement({ onBack, userId }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    color: COLOR_PALETTE[0].value,
    description: '',
  });
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`http://localhost/react-app/privacy_game/backend/api/get_department_stats.php?user_id=${userId}`);
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setFormErrors([]);
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color
    }));
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setFormErrors([]);
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost/react-app/privacy_game/backend/api/add_department.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormErrors([data.error || 'Failed to create department']);
        return;
      }

      // Reset form
      setFormData({
        name: '',
        display_name: '',
        color: COLOR_PALETTE[0].value,
        description: '',
      });
      setShowCreateForm(false);

      // Refresh departments list
      fetchDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
      setFormErrors(['Failed to create department. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <p className="text-foreground">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border mb-6">
          <div className="flex justify-between items-center mb-6">
          <div className="border-l-4 border-green-500 pl-4">
            <h2 className="text-3xl font-semibold text-foreground">Afdelingen Beheer</h2>
          </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + Afdeling Toevoegen
              </button>
              <button
                onClick={onBack}
                className="bg-muted hover:bg-muted text-muted-foreground font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Terug
              </button>
            </div>
          </div>

          {/* Create Department Form */}
          {showCreateForm && (
            <div className="bg-muted p-6 rounded-xl border border-green-500 mb-6">
              <h3 className="text-2xl font-semibold text-foreground mb-4">Nieuwe Afdeling Aanmaken</h3>

              {formErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                  <p className="text-red-600 font-medium">Fouten:</p>
                  <ul className="mt-2 space-y-1">
                    {formErrors.map((error, idx) => (
                      <li key={idx} className="text-red-600 text-sm">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleCreateDepartment} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Afdelingsnaam (intern) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="bijv. IT, HR, Finance"
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-green-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">2-50 tekens, letters/nummers/hyphens</p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Weergavenaam *
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="bijv. Information Technology"
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Beschrijving van de afdeling (optioneel)"
                    rows="3"
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>

                {/* Color Palette */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Kleur Selecteren *
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {COLOR_PALETTE.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        type="button"
                        onClick={() => handleColorSelect(colorOption.value)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                          formData.color === colorOption.value
                            ? 'ring-2 ring-green-500 ring-offset-2'
                            : 'hover:opacity-80'
                        }`}
                        title={colorOption.name}
                      >
                        <div
                          className="w-10 h-10 rounded-lg shadow-md transition-transform hover:scale-110"
                          style={{ backgroundColor: colorOption.value }}
                        ></div>
                        <span className="text-xs text-foreground text-center font-medium">
                          {colorOption.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: formData.color }}
                    ></div>
                    <span className="text-sm text-foreground">Geselecteerde kleur: {formData.color}</span>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Aan het creëren...' : 'Afdeling Aanmaken'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setFormErrors([]);
                      setFormData({
                        name: '',
                        display_name: '',
                        color: COLOR_PALETTE[0].value,
                        description: '',
                      });
                    }}
                    className="flex-1 bg-muted hover:bg-muted text-muted-foreground font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Department Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="game-card game-card-hover cursor-pointer"
                style={{ borderLeft: `4px solid ${dept.color}` }}
                onClick={() => setSelectedDepartment(dept)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-foreground">{dept.display_name}</h3>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  ></div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Medewerkers:</span>
                    <span className="text-lg font-bold text-foreground">{dept.user_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Totale Punten:</span>
                    <span className="text-lg font-bold" style={{ color: dept.color }}>
                      {dept.total_points}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gemiddeld:</span>
                    <span className="text-sm font-medium text-foreground">{dept.avg_points} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Achievements:</span>
                    <span className="text-sm font-medium text-foreground">{dept.total_achievements}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="bg-muted p-6 rounded-xl border-l-4 border-green-500">
            <h3 className="text-xl font-semibold text-foreground mb-4\">🏆 Afdeling Ranglijst (Top Presteerders)</h3>
            <div className="space-y-3">
              {departments
                .sort((a, b) => b.total_points - a.total_points)
                .map((dept, index) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      ></div>
                      <span className="font-semibold text-foreground">{dept.display_name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-muted-foreground">{dept.user_count} leden</span>
                      <span className="text-xl font-bold" style={{ color: dept.color }}>
                        {dept.total_points} pts
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Department Detail Modal */}
        {selectedDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: selectedDepartment.color }}
                  ></div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {selectedDepartment.display_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Department Stats Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Medewerkers</p>
                  <p className="text-2xl font-bold text-foreground">{selectedDepartment.user_count}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Totale Punten</p>
                  <p className="text-2xl font-bold" style={{ color: selectedDepartment.color }}>
                    {selectedDepartment.total_points}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">Achievements</p>
                  <p className="text-2xl font-bold text-foreground">{selectedDepartment.total_achievements}</p>
                </div>
              </div>

              {/* User List */}
              <h4 className="text-lg font-semibold text-foreground mb-4">Medewerkers</h4>
              {selectedDepartment.users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Geen medewerkers in deze afdeling</p>
              ) : (
                <div className="space-y-2">
                  {selectedDepartment.users.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium text-foreground">{user.username}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Punten</p>
                          <p className="font-bold" style={{ color: selectedDepartment.color }}>
                            {user.points}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Achievements</p>
                          <p className="font-bold text-foreground">{user.achievements_unlocked}</p>
                        </div>
                        {user.last_login_at && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Laatst actief</p>
                            <p className="text-xs text-foreground">
                              {new Date(user.last_login_at).toLocaleDateString('nl-NL')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
