import { useState, useEffect } from "react";

export default function QuestionManagement({ onBack, userId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    question_text: "",
    answer_type: "multiple_choice",
    options: "",
    correct_answer: "",
    category: "",
    difficulty: ""
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://localhost/react-app/privacy_game/backend/api/get_questions.php");
      const data = await response.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setQuestions(data.questions || []);
      }
    } catch (error) {
      setMessage("Fout bij ophalen van vragen");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question_text.trim()) {
      setMessage("Vraag tekst is verplicht");
      return;
    }

    const endpoint = editingQuestion 
      ? "http://localhost/react-app/privacy_game/backend/api/update_question.php"
      : "http://localhost/react-app/privacy_game/backend/api/add_question.php";

    const payload = {
      ...formData,
      options: formData.options ? formData.options.split(',').map(o => o.trim()) : null,
      ...(editingQuestion && { id: editingQuestion.id }),
      user_id: userId
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.success);
        fetchQuestions();
        resetForm();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Fout bij opslaan van vraag");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Weet je zeker dat je deze vraag wilt verwijderen?")) return;

    try {
      const response = await fetch("http://localhost/react-app/privacy_game/backend/api/delete_question.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, user_id: userId })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.success);
        fetchQuestions();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Fout bij verwijderen van vraag");
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      answer_type: question.answer_type || "multiple_choice",
      options: Array.isArray(question.options) ? question.options.join(', ') : "",
      correct_answer: question.correct_answer || "",
      category: question.category || "",
      difficulty: question.difficulty || ""
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      question_text: "",
      answer_type: "multiple_choice",
      options: "",
      correct_answer: "",
      category: "",
      difficulty: ""
    });
    setEditingQuestion(null);
    setShowAddForm(false);
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border mb-6">
          <div className="flex justify-between items-center mb-6">
          <div className="border-l-4 border-green-500 pl-4">
            <h2 className="text-3xl font-semibold text-foreground">Vragen Beheer</h2>
          </div>
            <button
              onClick={onBack}
              className="bg-muted hover:bg-muted text-muted-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Terug
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.includes('succesvol') ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
              {message}
            </div>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mb-6 bg-primary hover:bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {showAddForm ? "Annuleren" : "Nieuwe Vraag Toevoegen"}
          </button>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-muted rounded-lg">
              <h3 className="text-xl font-medium text-foreground mb-4">
                {editingQuestion ? "Vraag Bewerken" : "Nieuwe Vraag"}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Vraag Tekst *</label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Antwoord Type</label>
                  <input
                    type="text"
                    name="answer_type"
                    value={formData.answer_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categorie</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Opties (komma gescheiden)</label>
                <input
                  type="text"
                  name="options"
                  value={formData.options}
                  onChange={handleInputChange}
                  placeholder="Optie 1, Optie 2, Optie 3"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Correct Antwoord</label>
                  <input
                    type="text"
                    name="correct_answer"
                    value={formData.correct_answer}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Moeilijkheidsgraad</label>
                  <input
                    type="text"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    placeholder="bv. easy, medium, hard"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {editingQuestion ? "Bijwerken" : "Toevoegen"}
                </button>
                {editingQuestion && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-muted hover:bg-muted text-muted-foreground font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Annuleren
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-card p-8 rounded-2xl shadow-xl border border-border text-center">
              <p className="text-muted-foreground">Geen vragen gevonden. Voeg je eerste vraag toe!</p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="game-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-foreground flex-1">{question.question_text}</h3>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="bg-primary hover:bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="bg-destructive hover:bg-destructive text-destructive-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-3">
                  {question.category && <p><strong>Categorie:</strong> {question.category}</p>}
                  {question.difficulty && <p><strong>Moeilijkheid:</strong> {question.difficulty}</p>}
                  {question.answer_type && <p><strong>Type:</strong> {question.answer_type}</p>}
                  {question.correct_answer && <p><strong>Correct:</strong> {question.correct_answer}</p>}
                </div>
                
                {question.options && Array.isArray(question.options) && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground mb-1">Opties:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {question.options.map((option, idx) => (
                        <li key={idx}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
