package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.tv.material3.Button
import androidx.tv.material3.Card
import androidx.tv.material3.CardDefaults
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.Text
import androidx.tv.material3.darkColorScheme
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.material3.ButtonDefaults.buttonColors

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ActorsTVTheme {
                ActorsTVApp()
            }
        }
    }

    @OptIn(ExperimentalTvMaterial3Api::class)
    @Composable
    fun ActorsTVTheme(content: @Composable () -> Unit) {
        MaterialTheme(
            colorScheme = darkColorScheme(
                primary = Color(0xFF1976D2),
                secondary = Color(0xFF03DAC6),
                background = Color(0xFF121212),
                surface = Color(0xFF1E1E1E)
            )
        ) {
            content()
        }
    }

    @OptIn(ExperimentalTvMaterial3Api::class)
    @Composable
    fun ActorsTVApp() {
        val viewModel = remember { ActorViewModel() }
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "openforcodeTV",
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleLarge
                    )

                    Button(
                        onClick = { viewModel.showAddDialog() },
                        modifier = Modifier.padding(9.dp)
                    ) {
                        Text(text = "Add", fontStyle = FontStyle.Italic, fontSize = 13.sp)
                    }
                }

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    items(viewModel.actors) { actor ->
                        ActorCard(
                            actor = actor,
                            onActorClick = { viewModel.selectActor(it) },
                            onEditClick = {
                                viewModel.selectedActor.value = it
                                viewModel.showEditDialog(it)
                            },
                            onDeleteClick = { viewModel.deleteActor(it) }
                        )
                    }
                }
            }

            viewModel.selectedActor.value?.let { actor ->
                // Only show details overlay when not in edit mode
                if (!viewModel.showEditDialog.value && !viewModel.showAddDialog.value) {
                    ActorDetailsOverlay(
                        actor = actor,
                        onDismiss = { viewModel.selectActor(null) }
                    )
                }
            }

            if (viewModel.showAddDialog.value) {
                ActorFormDialog(
                    title = "Ajouter un acteur",
                    onDismiss = { viewModel.hideAddDialog() },
                    onSave = { actor ->
                        viewModel.addActor(actor)
                        viewModel.hideAddDialog()
                    }
                )
            }

            if (viewModel.showEditDialog.value) {
                viewModel.selectedActor.value?.let { actor ->
                    ActorFormDialog(
                        title = "Modifier l'acteur",
                        actor = actor,
                        onDismiss = { viewModel.hideEditDialog() },
                        onSave = { updatedActor ->
                            viewModel.updateActor(updatedActor)
                            viewModel.hideEditDialog()
                        }
                    )
                }
            }
        }
    }

    @OptIn(ExperimentalTvMaterial3Api::class)
    @Composable
    fun ActorCard(
        actor: Actor,
        onActorClick: (Actor) -> Unit,
        onEditClick: (Actor) -> Unit,
        onDeleteClick: (Actor) -> Unit
    ) {
        var isFocused by remember { mutableStateOf(false) }
        val focusRequester = remember { FocusRequester() }

        val buttonInteractionSource = remember { MutableInteractionSource() }

        Card(
            modifier = Modifier
                .clickable { onActorClick(actor) }
                .size(280.dp, 420.dp)
                .focusRequester(focusRequester)
                .focusable()
                .onFocusChanged { isFocused = it.isFocused }
                .scale(if (isFocused) 1.05f else 1f)
                .border(
                    width = if (isFocused) 3.dp else 0.dp,
                    color = if (isFocused) MaterialTheme.colorScheme.primary else Color.Transparent,
                    shape = RoundedCornerShape(12.dp)
                ),
            shape = CardDefaults.shape(),
            onClick = { onActorClick(actor) },
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                        .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                        .background(Color.Gray),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "",
                        fontSize = 48.sp,
                        color = Color.White,
                    )
                }
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = actor.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "${actor.age} ans • ${actor.nationality}",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "${actor.movies.size} films",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier.weight(1f)
                            .clickable (
                                interactionSource = buttonInteractionSource,
                                indication = null,
                            ){
                                onEditClick(actor)
                            }
                    ) {
                        Button(
                            onClick = {
                               onEditClick(actor)
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Modifier")
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Box(
                        modifier = Modifier.weight(1f)
                            .clickable (
                                interactionSource = buttonInteractionSource,
                                indication = null)
                            {
                                onDeleteClick(actor)
                            }
                    ) {

                        Button(
                            onClick = {
                                onDeleteClick(actor)
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = "Supprimer")
                        }
                    }
                }
            }
        }
    }

    @OptIn(ExperimentalTvMaterial3Api::class)
    @Composable
    fun ActorFormDialog(
        title: String,
        actor: Actor? = null,
        onDismiss: () -> Unit,
        onSave: (Actor) -> Unit
    ) {
        var name by remember { mutableStateOf(actor?.name ?: "") }
        var age by remember { mutableStateOf(actor?.age?.toString() ?: "") }
        var nationality by remember { mutableStateOf(actor?.nationality ?: "") }
        var biography by remember { mutableStateOf(actor?.biography ?: "") }

        Dialog(onDismissRequest = onDismiss) {
            Card(
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .fillMaxHeight(0.7f),
                shape = CardDefaults.shape(),
                onClick = { }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    verticalArrangement = Arrangement.SpaceBetween,
                ) {


                    Column{

                        Text(
                            text = title,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Nom") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = age,
                            onValueChange = { age = it },
                            label = { Text("Âge") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = nationality,
                            onValueChange = { nationality = it },
                            label = { Text("Nationalité") },
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = biography,
                            onValueChange = { biography = it },
                            label = { Text("Biographie") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3,
                            maxLines = 5
                        )
                    }


                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(
                            onClick = onDismiss,

                        ) {
                            Text("Annuler")
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        Button(
                            onClick = {
                                val newActor = Actor(
                                    id = actor?.id ?: 0,
                                    name = name,
                                    age = age.toIntOrNull() ?: 0,
                                    nationality = nationality,
                                    biography = biography,
                                    imageUrl = "",
                                    movies = actor?.movies ?: emptyList()
                                )
                                onSave(newActor)
                            },
                            enabled = name.isNotBlank() && age.isNotBlank()
                        ) {
                            Text("Sauvegarder")
                        }
                    }
                }
            }
        }
    }

    @OptIn(ExperimentalTvMaterial3Api::class)
    @Composable
    fun ActorDetailsOverlay(
        actor: Actor,
        onDismiss: () -> Unit
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.7f))
                .clickable { onDismiss() },
            contentAlignment = Alignment.Center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .fillMaxHeight(0.8f),
                shape = CardDefaults.shape(),
                onClick = { /* No action - prevent event propagation */ }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp)
                ) {
                    Text(
                        text = actor.name,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "${actor.age} ans • ${actor.nationality}",
                        fontSize = 18.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = actor.biography,
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Text(
                        text = "Films",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(actor.movies) { movie ->
                            Text(
                                text = movie,
                                color = MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.3f))
                                    .padding(8.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}