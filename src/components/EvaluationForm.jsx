import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getEvaluationById } from '../data/courseData';
import styles from './Evaluation.module.css';

const EvaluationForm = ({ evaluationId, courseId, onSuccess }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEval = async () => {
      // Intentar primero cargar desde los datos hardcodeados
      const localEval = getEvaluationById(evaluationId);
      if (localEval) {
        setEvaluation(localEval);
        setLoading(false);
        return;
      }

      // Si no está hardcodeado, hacer petición al backend
      try {
        const data = await api.get(`/evaluations/${evaluationId}`);
        setEvaluation(data);
      } catch (err) {
        setError(err.message || 'Error al cargar evaluación');
      } finally {
        setLoading(false);
      }
    };
    fetchEval();
  }, [evaluationId]);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const questionsList = evaluation?.questions || evaluation?.Questions || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (questionsList.length > 0 && Object.keys(answers).length < questionsList.length) {
      setError(`Por favor responde las ${questionsList.length} preguntas antes de enviar.`);
      return;
    }

    try {
      let scorePercentage = 0;

      if (questionsList.length > 0) {
        let totalScore = 0;
        let maxScore = 0;

        questionsList.forEach(q => {
          maxScore += q.score || 1;
          const selectedOptionId = answers[q.id];
          const optionsList = q.options || q.Options || [];
          const selectedOption = optionsList.find(o => String(o.id) === String(selectedOptionId));
          if (selectedOption && selectedOption.is_correct) {
            totalScore += q.score || 1;
          }
        });

        scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      }

      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: parseInt(qId),
        optionId: answers[qId]
      }));

      let res;
      try {
        res = await api.post(`/evaluations/${evaluationId}/submit`, {
          answers: formattedAnswers,
          percentage: scorePercentage,
          is_final: evaluation?.is_final || false,
          courseId: courseId || evaluation?.courseId || 1
        });
        if (!res || (res.percentage === 0 && scorePercentage > 0)) {
          res = {
            percentage: scorePercentage,
            passed: scorePercentage >= 70
          };
        }
      } catch (apiErr) {
        // Fallback local en caso de error de servidor
        res = {
          percentage: scorePercentage,
          passed: scorePercentage >= 70
        };
      }

      setResult(res);
      if (res.passed && onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      setError(err.message || 'Error al enviar evaluación');
    }
  };

  if (loading) return <div>Cargando evaluación...</div>;
  if (error) return <div className="alert">{error}</div>;
  if (!evaluation) return null;

  return (
    <div className={styles.evalContainer}>
      <h4>{evaluation.title}</h4>
      
      {result && (
        <div className={`alert ${result.passed ? 'alert-success' : 'alert-danger'} mt-2 mb-4`} style={{padding: '1rem', borderRadius: '0.375rem', backgroundColor: result.passed ? '#ecfdf5' : '#fef2f2', color: result.passed ? '#065f46' : '#991b1b'}}>
          Obtuviste un {result.percentage.toFixed(2)}%.
          {result.passed ? ' ¡Aprobado!' : ' No aprobado. Debes obtener al menos 70% para continuar.'}
        </div>
      )}

      {!result?.passed && (
        <form onSubmit={handleSubmit}>
          {questionsList.map((q, index) => {
            const optionsList = q.options || q.Options || [];
            return (
              <div key={q.id} className={styles.questionBlock}>
                <p className={styles.questionText}>{index + 1}. {q.text}</p>
                <div className={styles.optionsList}>
                  {optionsList.map(opt => (
                    <label key={opt.id} className={styles.optionLabel}>
                      <input 
                        type="radio" 
                        name={`question-${q.id}`} 
                        value={opt.id}
                        onChange={() => handleOptionChange(q.id, opt.id)}
                        required
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
          <button type="submit" className="btn btn-primary mt-4">Enviar Respuestas</button>
        </form>
      )}
    </div>
  );
};

export default EvaluationForm;
