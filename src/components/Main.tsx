import React, { useEffect, useState } from "react"
import BottomNavigationa from "./BottomNavigationa"
import ProgressBar from "./ProgressBar"
import { SingleAnswer } from "./QuestionTypes/SingleAnswer"
import { MultipleAnswers } from "./QuestionTypes/MultipleAnswers"
import { ShortAnswer } from "./QuestionTypes/ShortAnswer"
import { DetailedAnswer } from "./QuestionTypes/DetailedAnswer"
import { StartPage } from "./StartPage"
import { CreateTest } from "../utils"
import { AnswerTypes } from "../Types"
import { useTimer } from "../hooks/useTimer"
import Timer from "./Timer"
import { ResultPage } from "./ResultPage"

const testBuilder = new CreateTest()

testBuilder
  .addTest(AnswerTypes.SingleAnswer, "How many apples in the basket?", [
    "2 apples",
    "3 apples",
    "5 apples",
  ])
  .addTest(AnswerTypes.MultipleAnswers, "What is your favorites languages?", [
    "Russian",
    "German",
    "Italian",
    "English",
  ])
  .addTest(AnswerTypes.ShortAnswer, "What is your favorite food?")
  .addTest(
    AnswerTypes.DetailedAnswer,
    "What is you favorite season? Describe why and use atleast 100 words"
  )

const test = testBuilder.build()
console.log("test", test)
interface SurveyResponse {
  [key: string]: string | string[]
}

const MainComponent = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<SurveyResponse>(() => {
    const saved = localStorage.getItem("answers")
    return saved ? JSON.parse(saved) : {}
  })

  const { timeLeft, startTimer, stopTimer } = useTimer()

  useEffect(() => {
    localStorage.setItem("answers", JSON.stringify(answers))
  }, [answers])

  const handleNext = () => setCurrentStep((prev) => prev + 1)

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if ("checked" in e.target) {
      const { name, value, type, checked } = e.target

      setAnswers((prev) => {
        if (type === "checkbox") {
          const prevValues = (prev[name] || []) as string[]

          const newValues = checked
            ? [...prevValues, value]
            : prevValues.filter((v: any) => v !== value)

          return { ...prev, [name]: newValues }
        } else {
          return { ...prev, [name]: value }
        }
      })
    } else {
      const { name, value } = e.target

      setAnswers((prev) => {
        return { ...prev, [name]: value }
      })
    }
  }

  const renderStep = () => {
    const current = test[currentStep]

    switch (current.type) {
      case AnswerTypes.Start:
        return <StartPage questionName={current.questionName} />

      case AnswerTypes.SingleAnswer:
        return (
          <SingleAnswer
            handleChange={handleChange}
            questionName={current.questionName}
            options={current.options!}
          />
        )
      case AnswerTypes.MultipleAnswers:
        return (
          <MultipleAnswers
            handleChange={handleChange}
            questionName={current.questionName}
            options={current.options!}
          />
        )
      case AnswerTypes.ShortAnswer:
        return (
          <ShortAnswer
            handleChange={handleChange}
            questionName={current.questionName}
          />
        )
      case AnswerTypes.DetailedAnswer:
        return (
          <DetailedAnswer
            handleChange={handleChange}
            questionName={current.questionName}
          />
        )
      case AnswerTypes.End:
        return <ResultPage questionName={current.questionName} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 font-roboto">Тестирование</h1>
          <Timer timeLeft={timeLeft} />
        </div>
        <ProgressBar currentStep={currentStep} testLength={test.length} />
        {renderStep()}
        <BottomNavigationa
          currentStep={currentStep}
          testLength={test.length}
          handleNext={handleNext}
          startTimer={startTimer}
          stopTimer={stopTimer}
        />
      </div>
    </div>
  )
}

export default MainComponent