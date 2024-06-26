import fs from 'fs/promises'
import path from 'path'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
})

const capitalizeModels = async (): Promise<void> => {
  const modelsDir = path.join(__dirname, '../models')

  try {
    const files = await fs.readdir(modelsDir)

    const modelFiles = files.filter(
      (file) => file.endsWith('.ts') && file !== 'index.ts'
    )

    const importPromises = modelFiles.map(async (file) => {
      const filePath = path.join(modelsDir, file)
      const importedModel = require(filePath).default

      if (Boolean(importedModel) && typeof importedModel === 'function') {
        const modelName = file.replace(/\.ts$/, '')
        const model = importedModel(sequelize)
        sequelize.models[modelName] = model
        console.log('Modelo cargado:', sequelize.models[modelName])
      }
    })

    await Promise.all(importPromises)

    console.log('Carga de modelos completada.')
  } catch (error) {
    console.error('Error al leer los modelos:', error)
    throw error // Rechazar la promesa en caso de error
  }
}

export default async (): Promise<{ [key: string]: any }> => {
  await capitalizeModels()
  return {
    ...sequelize.models,
    conn: sequelize
  }
}
